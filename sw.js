const CACHE='cpro-v1';

self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});

self.addEventListener('message',e=>{
  if(!e.data)return;
  if(e.data.type==='SCHEDULE_NOTIFICATIONS'){
    scheduleNotifications(e.data.bills,e.data.todayStr);
  }
  if(e.data.type==='CLEAR_NOTIFICATIONS'){
    // nothing to clear for local notifications scheduled via setTimeout
  }
});

function scheduleNotifications(bills,todayStr){
  if(!bills||!bills.length)return;
  bills.forEach(b=>{
    const delay=b.delayMs||0;
    setTimeout(()=>{
      self.registration.showNotification(b.title,{
        body:b.body,
        icon:'/apple-touch-icon.png',
        badge:'/apple-touch-icon.png',
        tag:b.tag||b.id,
        renotify:false,
        data:{url:'/'},
      });
    },delay);
  });
}

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
      if(cs.length){cs[0].focus();return;}
      return self.clients.openWindow('/');
    })
  );
});
