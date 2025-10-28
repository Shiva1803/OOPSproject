import json


#use json to load and dump data 
#file type is json list

def load_data():
    try: 
        with open('youtube.text', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []
    
#helper method
def save_data_helper(videos):
    with open('youtube.txt', 'w') as file:
        json.dump(videos, file)



def list_all_videos(videos):
    print("\n")
    print("*" * 70)
    for index, video in enumerate(videos, start=1):
        print(f"{index}. {video['name']}, Duration: {video['time']} ")

def add_video(videos):
    name = input("enter video name: ")
    time = input("enter video time: ")
    videos.append({'name': name, 'time':time})
    save_data_helper(videos)


#mthodology: show user all videos
#check the index range and update the video, then save using save_data_helper
def update_video(videos):
    list_all_videos(videos)
    index = int(input("Enter the video number to update"))
    if 1 <= index <= len(videos):
        name = input("Enter the new video name")
        time = input("Enter the new videot time")
        videos[index-1] = {'name': name, "time": time}
        save_data_helper(videos)
    else:
        print("Invalid index selected")

#methodology: list videos, check index range
#use del function to delete videos

def delete_video(videos):
    list_all_videos(videos)
    index = int(input("Enter the video number to be deleted"))
    if 1 <= index <= len(videos):
        del videos[index-1]
        save_data_helper(videos)
    else:
        print("Invalid index selected")

def main():
    videos = load_data()
    while True:
        print("\n Youtube Manager | Choose an option")
        print("1. List all favourite video")
        print("2. Add a YouTube video")
        print("3. Update a YouTube video details")
        print("4. Delete a YouTube video")
        print("5. Exit the app")

        choice = input("Enter your choice ")
        print(videos)
        
        #match syntax to match variables/syntax
        match choice:
            case '1':
                list_all_videos(videos)
            case '2':
                add_video(videos)
            case '3':
                update_video(videos)
            case '4':
                delete_video(videos)
            case '5':
                break
            case _:
                print("invalid choice")

if __name__ == "__main__":
    main()

