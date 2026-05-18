var API = {
  async request(method, path, data) {
    var options = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    var token = localStorage.getItem('token');
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(path, options);
    var json = await res.json();
    if (!res.ok) throw new Error(json.error || '请求失败');
    return json;
  },
  get: function (path) { return this.request('GET', path); },
  post: function (path, data) { return this.request('POST', path, data); },
  put: function (path, data) { return this.request('PUT', path, data); },
  del: function (path) { return this.request('DELETE', path); }
};
