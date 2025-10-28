class YouTubeManager {
    constructor() {
        this.videos = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadVideos();
    }

    bindEvents() {
        // Add video form submission
        document.getElementById('videoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addVideo();
        });

        // Edit form submission
        document.getElementById('saveChanges').addEventListener('click', () => {
            this.updateVideo();
        });
    }

    async loadVideos() {
        try {
            const response = await fetch('/api/videos');
            this.videos = await response.json();
            this.renderVideos();
            this.updateVideoCount();
        } catch (error) {
            this.showToast('Error loading videos', 'error');
            console.error('Error:', error);
        }
    }

    async addVideo() {
        const name = document.getElementById('videoName').value.trim();
        const time = document.getElementById('videoTime').value.trim();
        const url = document.getElementById('videoUrl').value.trim();

        if (!name || !time) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, time, url })
            });

            if (response.ok) {
                this.showToast('Video added successfully!', 'success');
                document.getElementById('videoForm').reset();
                this.loadVideos();
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error adding video', 'error');
            }
        } catch (error) {
            this.showToast('Error adding video', 'error');
            console.error('Error:', error);
        }
    }

    async updateVideo() {
        const id = document.getElementById('editVideoId').value;
        const name = document.getElementById('editVideoName').value.trim();
        const time = document.getElementById('editVideoTime').value.trim();
        const url = document.getElementById('editVideoUrl').value.trim();

        if (!name || !time) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/videos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, time, url })
            });

            if (response.ok) {
                this.showToast('Video updated successfully!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                this.loadVideos();
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Error updating video', 'error');
            }
        } catch (error) {
            this.showToast('Error updating video', 'error');
            console.error('Error:', error);
        }
    }

    async deleteVideo(id) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            const response = await fetch(`/api/videos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showToast('Video deleted successfully!', 'success');
                this.loadVideos();
            } else {
                this.showToast('Error deleting video', 'error');
            }
        } catch (error) {
            this.showToast('Error deleting video', 'error');
            console.error('Error:', error);
        }
    }

    editVideo(id) {
        const video = this.videos.find(v => v.id === id);
        if (!video) return;

        document.getElementById('editVideoId').value = video.id;
        document.getElementById('editVideoName').value = video.name;
        document.getElementById('editVideoTime').value = video.time;
        document.getElementById('editVideoUrl').value = video.url || '';

        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    }

    renderVideos() {
        const container = document.getElementById('videosContainer');
        
        if (this.videos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fab fa-youtube"></i>
                    <h5>No videos yet</h5>
                    <p>Add your first video using the form above!</p>
                </div>
            `;
            return;
        }

        const videosHtml = this.videos.map(video => `
            <div class="video-item fade-in">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <div class="video-title">${this.escapeHtml(video.name)}</div>
                        <div class="video-duration">
                            <i class="fas fa-clock"></i> ${this.escapeHtml(video.time)}
                        </div>
                    </div>
                    <div class="col-md-4">
                        ${video.url ? `
                            <a href="${this.escapeHtml(video.url)}" target="_blank" class="video-url">
                                <i class="fas fa-external-link-alt"></i> Watch on YouTube
                            </a>
                        ` : '<span class="text-muted">No URL provided</span>'}
                    </div>
                    <div class="col-md-2 text-end">
                        <div class="btn-group btn-group-sm video-actions" role="group">
                            <button type="button" class="btn btn-outline-primary" onclick="app.editVideo(${video.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger" onclick="app.deleteVideo(${video.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = videosHtml;
    }

    updateVideoCount() {
        const count = this.videos.length;
        const countElement = document.getElementById('videoCount');
        countElement.textContent = `${count} video${count !== 1 ? 's' : ''}`;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastHeader = toast.querySelector('.toast-header i');
        
        // Update icon and color based on type
        toastHeader.className = `fas me-2 ${
            type === 'success' ? 'fa-check-circle text-success' :
            type === 'error' ? 'fa-exclamation-circle text-danger' :
            'fa-info-circle text-primary'
        }`;
        
        toastMessage.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new YouTubeManager();
});