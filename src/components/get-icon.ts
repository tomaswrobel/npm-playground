export default function (fileName: string) {
    const extension = fileName.split(".").pop() || "";
    const icon = document.createElement("span");

    switch (extension) {
        case "js":
            icon.classList.add("icon-javascript");
            break;
        case "ts":
            icon.classList.add("icon-typescript");
            break;
        case "tsx":
            icon.style.color = "#0288d1";
        case "jsx":
            icon.classList.add("icon-react");
            break;
        case "css":
            icon.classList.add("icon-css");
            break;
        default:
            icon.classList.add("icon-unsupported");
            icon.title = "File not supported. It won't be bundled";
    }

    return icon;
}