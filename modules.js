/**
 * @file Helper functions to get information about modules from the drupal
 *  module listing page.
 */
function ModuleList() {
  var cache = {};
  /**
   *  Helper function to get a value from an object or array
   *  Takes the item and an arbitrary number of indexes to traverse
   *  Returns the value or the value that failed if the value doesn't exist
   */
  function get(item) {
    var l = 0, result = item;
    while(++l < arguments.length && (result = result[arguments[l]])){}
    return result;
  }

  function getModulesList() {
    if(cache.modules) return cache.modules;

    var parent, items, modules = {},
    doc = document,
    iframe = document.getElementsByClassName('overlay-active');
    if (iframe && iframe[0] && iframe[0].tagName == 'IFRAME') {
      doc = iframe[0].contentDocument;   
    }

    parent = doc.getElementById('system-modules') || false;
    
    modules.length = 0;
    
    if(parent) {
      items = parent.getElementsByTagName('label');
      var l = items.length;
      while(l--) {
        var item = items[l],
        check = get(item, 'parentElement', 'previousElementSibling'),
        text = get(item, 'children', 0, 'innerText');

        check = check ? check.getElementsByTagName('input')[0] : null;

        var name =  text.toLowerCase();
        var machine = name.replace(/ /g, '_');

        modules[text.toLowerCase()] = {
          label : item,
          check : check,
          title : text,
          name : name,
          machine : machine
        };

        if (!document.getElementsByClassName('rubik-processed')) {
          var backlink = document.createElement('a');
          backlink.href='#'
          backlink.innerText = '[top]';
          backlink.title = 'Back to top';
          backlink.onclick = function(e) {
            window.scrollTo(0, 0);
            return false;
          };

          item.parentElement.appendChild(backlink);
        }

        modules.length++;
      }
    }

    cache.modules = modules;
    return modules;
  }

  function getModule (name) {
    name = name.toLowerCase();
    var modules = getModulesList();
    return modules[name] ? modules[name] : false;   
  }

  function gotoModule(name) {
    var module = getModule(name);
    var top = module.check;
    window.scrollTo(0, getTop(top) - 100);    
  }

  /**
   * Helper function to get the total offset top of an element
   */
   function getTop(el) {
    var top = 0;
    while(el && el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
    }
    return top;
  }

  /**
   *  Create a simple widget for suggesting matching modules
   */
  var suggest = (function() { 
    var aliases = {
      'ctools' : 'chaos tools',
      'vntf' : 'views node taxonomy filter',
      'ga stats' : 'google analytics statistics',
      'gastats' : 'google analytics statistics',
      'ds' : 'display suite'
    };

    //helper functions
    function findMatches (search) {
      if (!search.length) { return false; }
      var ml = getModulesList(),
        search = search.toLowerCase(),
        alt = search.replace(/ /g, '_'),
        results = new Array();
      var added = {};
         
      for (var m in ml) {
        if (!added[m] && (m.indexOf(search) === 0 || m.indexOf(alt) === 0)) {
          added[m] = true;
          results.push(ml[m]);
        } else {
          for (var al in aliases) {
            if(!added[aliases[al]] && (al.indexOf(search) === 0 || al.indexOf(alt) === 0)) {
              added[aliases[al]] = true;
              results.push( ml[aliases[al]] );
            }
          }
        }
      }
      return results;
    }

    function makeResults (matches) {
      var list = document.createElement('ul');

      for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        var item = document.createElement('li');
        item.className = 'search-suggestion';

        var link = document.createElement('a');
        link.href = "#" + m.machine;
        link.innerText = m.title;
        link.rmodule = m.name;
        
        item.appendChild(link);
        list.appendChild(item);

        link.onclick = function(e) {
          gotoModule(this.rmodule);
          return false;
        }
      };
      return list;
    };

    function showResults (matches) {
      var el = document.createElement('div');
      el.appendChild(makeResults(matches));
      searchbar.appendChild(el);
      return el;
    }

    function hideResults (el) {
      if(el) {
        searchbar.removeChild(el);
      }
    }

    //main execution
    return function (search) {
      var status = cache.suggestStatus;
      if (!status) { status = {}; }

      var matches = findMatches(search);
      if (matches) {
        if (status.shown) {
          hideResults(status.el);
          status.el = showResults(matches);
        } else {
          status.el = showResults(matches);
        }
        status.shown = true;
      } else {
        hideResults(status.el);
        delete(status.el);
        status.shown = false;
      }

      cache.suggestStatus = status;
    };

  })(); //end suggest definition

  function linkDescriptions() {
    var reqs = document.getElementsByClassName('admin-requirements');
    var l = reqs.length;
    while(l--) {
      var cur = reqs[l];
      var items = cur.innerHTML.match(/ (([^:\(]+?) \(.+?\)),?/g);
      var j = items ? items.length : 0;
      while(j--) {
        var dep = items[j];
        var match = dep.match(/ (.+) \(.*\),?/);
        if(match) {
          dep = match[1];
          var link = '<a href="javascript:" class="gotomodule">' + dep + '</a>';
          cur.innerHTML = cur.innerHTML.replace(dep, link);
        }
      }
      var links = cur.getElementsByClassName('gotomodule');
      var j = links.length;
      while(j--) {
        var link = links[j];
        link.onclick = function(e) {
          gotoModule(this.innerText.toLowerCase());
          return false;
        }
      }
    }
  }

  /**
   *  Create elements and attach handlers
   */

  var searchbar = document.createElement('div');
  searchbar.id = 'drupalhelper-module-search-bar';

  var input = document.createElement('input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.name = 'drupalhelper-search';
  input.className = 'drupalhelper-input';

  input.onkeyup = function(e) {
    if(e.keyCode == 13) {
      gotoModule(this.value);
      return false;
    } else {
      suggest(this.value);  
    }
  };
  
  var instr = document.createElement('div');
  instr.innerText = ' Search for a module.';
  instr.className = 'instructions';
  searchbar.appendChild(instr);

  searchbar.appendChild(input);

  var actions = document.getElementsByClassName('form-actions');
  for (var i = actions.length - 1; i >= 0; i--) {
    var backlink = document.createElement('a');
    backlink.href='#'
    backlink.innerText = '[top]';
    backlink.title = 'Back to top';
    backlink.onclick = function(e) {
      window.scrollTo(0, 0);
      return false;
    };

    actions[i].appendChild(backlink);
  };

  var ldeps = document.createElement('a');
  ldeps.href = '#';
  ldeps.className = 'link-deps';
  ldeps.innerText = '[Link Dependencies]';
  ldeps.title = 'Link each dependecy so clicking it will scroll to that module.  This can take some time.';

  //maintain whether we have already linked these things
  var linked = false;
  ldeps.onclick = function() {
    if (!linked) {
      linked = true;
      linkDescriptions();
    }
  }

  instr.appendChild(ldeps);

  //create a link to send the use all the way to the bottom of the page.
  var bottom = document.createElement('a');
  bottom.href = '#';
  bottom.className = 'goto-bottom';
  bottom.title = 'Go to the bottom of the page.';
  bottom.innerText = '[bottom]';
  bottom.onclick = function(e) {
    window.scrollTo(0, document.body.scrollHeight);
    //for some reason it doesn't go all the way down in rubik if we don't run it twice
    setTimeout(function() {
      window.scrollTo(0, document.body.scrollHeight);
    }, 10);
    return false;
  };

  var sidebar = document.getElementsByClassName('column-side');
  var top = document.getElementById('console');
  if (sidebar && sidebar[0]) {
    sidebar = sidebar[0].getElementsByClassName('column-wrapper');
    //put the bottom link in the sidebar if its there
    var actions = sidebar[0].getElementsByClassName('form-actions');
    if(actions) {
      actions[0].appendChild(bottom);
      bottom.added = true;
    }
    sidebar[0].appendChild(searchbar);
  } else if (top) {
    top.appendChild(searchbar); 
  } else {
    var content = document.getElementsByClassName('region-content');
    if (content) {
      content = content[0];

      content.insertBefore(searchbar, content.firstElementChild);
    } else {
      console.log('Could not find a region to attach to.');
    }
  }

  if (!bottom.added) {
    //otherwise put the bottom link in the searchbar.
    instr.appendChild(bottom);
  }

  getModulesList();

}

ModuleList();