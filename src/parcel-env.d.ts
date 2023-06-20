declare module "bundle-text:*" {
    const content: string;
    export default content;
}

declare function require(name: string): any;