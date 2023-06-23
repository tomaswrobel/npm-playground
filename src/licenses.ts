import preview from "./components/preview";
import * as packages from "./packages";

let licenses = "";

for (const name in packages) {
    licenses += `${name}\n${packages[name as keyof typeof packages]}\n\n`;
}

export default `data:text/plain;charset=utf-8,${encodeURIComponent(licenses)}`;