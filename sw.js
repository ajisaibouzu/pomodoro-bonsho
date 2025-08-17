const CACHE_NAME = 'bonsho-timer-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './bonsho.png.png',
  './Bonsho04/Bonsho04-2(High).mp3'
];

// Service Worker インストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開いています');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除しています:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュから返すか、ネットワークから取得
        return response || fetch(event.request);
      }
    )
  );
});

// バックグラウンドメッセージ処理
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TIMER_UPDATE') {
    const { timeLeft, mode, isRunning } = event.data;
    
    // バックグラウンドでのタイマー状態管理
    if (isRunning && timeLeft <= 0) {
      // タイマー完了時の通知
      self.registration.showNotification('梵鐘タイマー', {
        body: `${mode}が完了しました！`,
        icon: './bonsho.png.png',
        badge: './bonsho.png.png',
        tag: 'timer-complete',
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'アプリを開く'
          }
        ]
      });
    }
  }
});

// 通知クリック処理
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll().then(clientList => {
        // 既にタブが開いている場合はそこにフォーカス
        for (const client of clientList) {
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        // 新しいタブを開く
        if (clients.openWindow) {
          return clients.openWindow('./index.html');
        }
      })
    );
  }
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', event => {
  if (event.tag === 'timer-sync') {
    event.waitUntil(
      // バックグラウンドでの同期処理
      console.log('バックグラウンド同期実行')
    );
  }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: './bonsho.png.png',
        badge: './bonsho.png.png'
      })
    );
  }
});