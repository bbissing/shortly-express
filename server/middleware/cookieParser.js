const parseCookies = (req, res, next) => {
  if (Object.keys(req.headers).length) {
    var cooks = req.headers.cookie.split('; ');
    cooks.forEach((cook) => {
      var [id, val] = cook.split('=');
      req.cookies[id] = val;
    });
  }
  next();
};

module.exports = parseCookies;