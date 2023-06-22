/// <reference lib="webworker" />
import {manifest, version} from '@parcel/service-worker';

async function install() {
    const cache = await caches.open(version);
    await cache.addAll(manifest);
}

addEventListener('install', e => (e as ExtendableEvent).waitUntil(install()));

async function activate() {
    const keys = await caches.keys();
    await Promise.all(
        keys.map(key => key !== version && caches.delete(key))
    );
}

addEventListener('activate', e => (e as ExtendableEvent).waitUntil(activate()));