import os

def list_directory_contents_recursive(path):
    contents = []
    try:
        for root, dirs, files in os.walk(path):
            contents.append({
                'path': root,
                'dirs': [os.path.join(root, d) for d in dirs],
                'files': [os.path.join(root, f) for f in files]
            })
        return contents
    except FileNotFoundError:
        return f"Error: The directory '{path}' does not exist."
    except PermissionError:
        return "Error: You do not have permission to access this directory."

def generate_text_structure(contents):
    structure = []
    
    def add_structure(item, indent=0):
        current_path = item['path']
        dir_name = os.path.basename(current_path) or current_path
        structure.append('    ' * indent + f"{dir_name}/")
        
        for dir_path in item['dirs']:
            add_structure({'path': dir_path, 'dirs': [], 'files': []}, indent + 1)
        
        for file_path in item['files']:
            file_name = os.path.basename(file_path)
            structure.append('    ' * (indent + 1) + f"{file_name}")

    for item in contents:
        add_structure(item)

    return "\n".join(structure)

# Specify the directory path
directory_path = '.'  # Current directory

# Get directory structure
contents = list_directory_contents_recursive(directory_path)

# Generate text structure
if isinstance(contents, list):
    text_structure = generate_text_structure(contents)
    
    # Save the text structure to a file
    with open('directory_structure.txt', 'w') as file:
        file.write(text_structure)

    print("Directory structure saved to 'directory_structure.txt'.")
else:
    print(contents)  # Print error message