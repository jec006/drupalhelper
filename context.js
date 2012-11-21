window.onload = function() {
  Array.prototype.last = function() {
    return this[this.length - 1];
  }
  var hasClass = function(el, cl) {
    var regex = new RegExp('^(.*\s)?' + cl + '(\s.*)?$');
    return el.className && regex.test(el.className);
  }
  var container = document.getElementById('edit-reactions-plugins-block-selector');

  if (container) {
    var options = container.getElementsByTagName('label');
    var size = options.length;

    while(size--) {
      var opt = options[size];

      if (hasClass(opt, 'option') && opt.htmlFor) {
        var inp = document.getElementById(opt.htmlFor);
        if(inp) {
          var machine = inp.name.split('][').last();
          machine = machine.substr(0, machine.length - 1).replace('-', ': ');
          opt.innerHTML += ' (<pre style="display:inline">' + machine + '</pre>)';
        }
      }
    }
  }
}