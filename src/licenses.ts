import * as packages from "./packages";

export default function () {
    let licenses = "";

    for (const name in packages) {
        licenses += `${name}\n${packages[name as keyof typeof packages]}\n\n`;
    }

    window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(licenses)}`, "output");
}