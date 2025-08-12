(function(){
  'use strict';
  function qs(s){ return document.querySelector(s); }
  function elGen(html){ var d=document.createElement('div'); d.innerHTML=html; return d.firstElementChild; }
  function show(view){
    qs('#view-admin').style.display = view==='admin'?'block':'none';
    qs('#view-check').style.display = view==='check'?'block':'none';
  }
  function router(){
    var h=(location.hash||'').toLowerCase();
    if(h.indexOf('#admin')===0){ show('admin'); loadLast(); }
    else if(h.indexOf('#check')===0){ show('check'); }
    else { show(''); }
  }
  function api(path, opts){
    return fetch(path, opts).then(function(res){
      if(!res.ok) return res.text().then(function(t){ throw new Error(t); });
      return res.json();
    });
  }
  window.addEventListener('hashchange', router);
  document.addEventListener('DOMContentLoaded', function(){
    router();

    qs('#form-gen').addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(e.target);
      var count = Math.max(1, Math.min(1000, parseInt(fd.get('count')||'1', 10)));
      var prize = (fd.get('prize')||'').trim();
      var out = qs('#generated'); out.innerHTML='Generuję...';
      api('/api/create', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({count:count, prize:prize})})
      .then(function(data){
        out.innerHTML='';
        data.codes.forEach(function(c){
          var url = location.origin + '/?check&code=' + encodeURIComponent(c);
          var html = '<div class="card"><div class="qr" data-qr="'+encodeURIComponent(url)+'"></div><div><b>'+c+'</b><br><small>'+url+'</small><br><a href="#" data-print="'+c+'" target="_blank">Wydruk testowy</a></div></div>';
          var card = elGen(html);
          out.appendChild(card);
          var holder = card.querySelector('[data-qr]');
          if(holder){ var img = new Image(); img.width=140; img.height=140; img.alt='QR'; img.src='https://api.qrserver.com/v1/create-qr-code/?size=140x140&data='+holder.getAttribute('data-qr'); holder.appendChild(img); }
        });
        loadLast();
      }).catch(function(err){ out.innerHTML = '<span style="color:#e45858">Błąd: '+err.message+'</span>'; });
    });

    function loadLast(){
      var box = qs('#last-codes'); box.innerHTML='Ładowanie...';
      api('/api/list').then(function(data){
        box.innerHTML='';
        data.rows.forEach(function(r){
          var url = location.origin + '/?check&code=' + encodeURIComponent(r.code);
          var row = elGen('<div style="margin:6px 0">'+
            '<b>'+r.code+'</b> • '+(r.prize||'')+' '+
            '<span class="pill">'+(r.redeemed_at? 'Wykorzystany':'Nowy')+'</span> '+
            ' • <a target="_blank" href="'+url+'">Link</a> '+
            ' • <a target="_blank" href="#" data-print="'+r.code+'">Druk</a>'+
          '</div>');
          box.appendChild(row);
        });
      }).catch(function(err){ box.innerHTML='Błąd: '+err.message; });
    }

    qs('#form-check').addEventListener('submit', function(e){
      e.preventDefault();
      var code = (new FormData(e.target).get('code')||'').toUpperCase().trim();
      var out = qs('#check-result'); out.innerHTML='Sprawdzam...';
      api('/api/check?code='+encodeURIComponent(code)).then(function(data){
        if(!data.found){ out.innerHTML = '<p class="card" style="color:var(--bad)">Nieprawidłowy kod.</p>'; return; }
        if(data.redeemed_at){ out.innerHTML = '<p class="card">Kod został już wykorzystany <b>'+data.redeemed_at+'</b>.</p>'; return; }
        var prize = data.prize || 'Niespodzianka!';
        out.innerHTML = '<div class="card"><h3>Gratulacje!</h3><p>Twoja nagroda: <b>'+prize+'</b></p>'+
          '<a class="pill" href="#" id="do-redeem">Oznacz jako wykorzystany</a></div>';
        var btn = qs('#do-redeem');
        btn.onclick = function(ev){
          ev.preventDefault();
          api('/api/redeem', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({code:code})})
          .then(function(r){ out.innerHTML = '<p class="card" style="color:var(--ok)">Zrealizowano! ('+r.redeemed_at+')</p>'; })
          .catch(function(err){ out.innerHTML = 'Błąd: '+err.message; });
        };
      }).catch(function(err){ out.innerHTML='Błąd: '+err.message; });
    });

    document.addEventListener('click', function(e){
      var a = e.target.closest('a[data-print]'); if(!a) return;
      e.preventDefault();
      var code = a.getAttribute('data-print');
      api('/api/check?code='+encodeURIComponent(code)).then(function(data){
        if(!data.found){ alert('Kod nie istnieje'); return; }
        var url = location.origin + '/?check&code=' + encodeURIComponent(code);
        var w = window.open('', '_blank');
        var html = '<!doctype html><html><head><meta charset="utf-8"><title>Druk</title>'+
          '<style>@media print{ .ticket{width:58mm} .ticket *{font-family:monospace} .tk-line{border-top:1px dashed #000;margin:8px 0} }</style>'+
          '</head><body><div class="ticket">'+
          '<h2>ZDrapka</h2><div class="tk-line"></div>'+
          '<div><img alt="QR" width="140" height="140" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data='+encodeURIComponent(url)+'"></div>'+
          '<div class="tk-line"></div>'+
          '<div><b>Kod:</b> '+code+'</div>'+
          '<div><b>Nagroda:</b> '+(data.prize||'niespodzianka')+'</div>'+
          '<div>Sprawdź: '+url+'</div>'+
          '<div class="tk-line"></div><div style="font-size:12px">Jednorazowy.</div>'+
          '</div><script>window.print();<\/script></body></html>';
        w.document.open(); w.document.write(html); w.document.close();
      });
    });

    var params = new URLSearchParams(location.search);
    if(params.has('check')){
      location.hash = '#check';
      var c = params.get('code')||'';
      var inp = qs('#form-check').querySelector('input[name="code"]');
      if(inp){ inp.value=c; if(c) qs('#form-check').dispatchEvent(new Event('submit')); }
    }
  });
})();