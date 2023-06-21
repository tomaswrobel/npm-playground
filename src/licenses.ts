import * as packages from "bundle-text:../node_modules/*/LICENSE";
import license from "bundle-text:../LICENSE";
import {name} from "../package.json";

export default function () {
    let licenses = `${name}\n${license}\n\n`;

    for (const name in packages) {
        licenses += `${name}\n${packages[name as keyof typeof packages]}\n\n`;
    }

    window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(licenses)}`, "output");
}