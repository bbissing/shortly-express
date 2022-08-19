const parseCookies = (req, res, next) => {
  if (req.headers.cookie) {
    var cooks = req.headers.cookie.split('; ');
    cooks.forEach((cook) => {
      var [id, val] = cook.split('=');
      req.cookies[id] = val;
    });
  }
  next();
};

module.exports = parseCookies;