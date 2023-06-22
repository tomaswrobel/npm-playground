import css from "bundle-text:./assets/css.txt";
import js from "bundle-text:./assets/js.txt";
import fileExplorer from "./components/file-explorer";
import "./components/code-editor";
import "./assets/style.css";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(
        new URL("service-worker.ts", import.meta.url),
        {type: "module"}
    );
}

fileExplorer.fileSystem.set("index.tsx", js);
fileExplorer.fileSystem.set("index.css", css);
fileExplorer.emit("open", "index.tsx");
fileExplorer.update();

if ("launchQueue" in window) {
    window.launchQueue.setConsumer(async ({files: [file]}) => {
        if (file) {
            await fileExplorer.openFile(await file.getFile());
        }
    });
}
