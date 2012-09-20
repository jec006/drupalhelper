/**
 * Provides functionality around making the permissions admin screen more usable
 * @author jec006
 */

/**
 * Make the module sections in the table collapsible.
 */
function makeCollapsible() {
  //some helper functions
  var makePlus = function(module) {
    //add a expand button.
    modules[m].colSpan--;

    var plus = document.createElement('td');
    plus.className = 'drupalhelper-expand';
    plus.innerText = '-';
    plus.module = module;
    plus.open = true;
    module.plus = plus;
    module.parentElement.appendChild(modules[m].plus);
    return plus;
  }

  var isModuleRow = function(tr) {
    var regex = /\smodule\s/i;
    return tr.firstChild && tr.firstChild.className && (regex.test(tr.firstChild.className) || tr.firstChild.className == 'module');
  }
  //end helper functions

  var table = document.getElementById('permissions');
  modules = table.getElementsByClassName('module');

  for (var m = 0; m < modules.length; m++) {
    makePlus(modules[m]);

    //collapse all the permissions under the module
    modules[m].permissions = [];
    var cur = modules[m].parentElement.nextElementSibling;
    while (cur && !isModuleRow(cur)) {
      handlePermission(cur);
      modules[m].permissions.push(cur);
      cur = cur.nextElementSibling;
    }

    modules[m].plus.onclick = function(e) {
      this.open = !this.open;
      for(var i = 0; i < this.module.permissions.length; i++) {
        this.module.permissions[i].style.display = this.open ? 'table-row' : 'none';
        this.innerText = this.open ? '-' : '+';
      }
    }

    if (modules[m].id == 'module-node') {
      handleNodePerms(modules[m]);
    }
  }

  var compress = document.getElementsByClassName('compact-link')[0];

  var collapse = document.createElement('a');
  collapse.className = 'drupalhelper-collapse';
  collapse.innerText = 'Collapse All Sections';
  collapse.onclick = function(e) {
    this.collapsed = !this.collapsed;
    for(var i = 0; i < modules.length; i++) {
      modules[i].plus.onclick.call(modules[i].plus, e);
    }
    this.innerText = this.collapsed ? 'Expand All Sections' : 'Collapse All Sections';
  }
  compress.appendChild(collapse);
}


/**
 * Add some better information and helpers for each permission row
 */
function handlePermission(row) {
  var item = row.firstChild;
  if (item) {
    var machine_name = item.firstChild.id.replace('edit-', '').replace(/\-/g, ' ');
    var checkall = document.createElement('a');
    checkall.innerText = 'Grant to All Roles';
    checkall.className = 'drupalhelper-grant-all';
    checkall.onclick = function(e) {
      this.activated = !this.activated;
      var checkboxes = row.getElementsByTagName('input');
      for(var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
          checkboxes[i].checked = this.activated;
        }
      }
      this.innerText = this.activated ? 'Remove from All Roles' : 'Grant to All Roles';
    }

    var div = document.createElement('div');
    div.innerHTML = '<span class="drupalhelper-machine-name">' + machine_name + '</span>';
    div.appendChild(checkall);
    item.appendChild(div);
  }
}


/**
 * Add special handling for node permissions.
 */
function handleNodePerms(node) {
  var action = {};
  action.create = []; action.delete_own = []; action.edit_own = []; action.delete_any = []; action.edit_any = [];
  for (var i = 0; i < node.permissions.length; i++) {
    var perm = node.permissions[i];
    var type = perm.firstChild.firstChild.id.replace('edit-', '');
    if (/^edit\-own\-/i.test(type)) {
      action.edit_own.push(perm);
    } else if (/^edit\-any\-/i.test(type)) {
      action.edit_any.push(perm);
    } else if (/^create\-/i.test(type)) {
      action.create.push(perm);
    } else if (/^delete\-own\-/i.test(type)) {
      action.delete_own.push(perm);
    } else if (/^delete\-any\-/i.test(type)) {
      action.delete_any.push(perm);
    }
  }

  var actionrow = document.createElement('tr');
  actionrow.className = 'drupalhelper-action-row';
  var td = document.createElement('td');
  td.innerText = 'Drupal Helper Actions';
  actionrow.appendChild(td);
  var cols = node.colSpan;
  while(cols--) {
    var td = document.createElement('td');
    td.className = 'drupalhelper-action-cell';
    for (var type in action) {
      var a = document.createElement('a');
      a.innerHTML = 'Grant ' + type.replace('_', ' ') + ' for all types';
      a.col = cols-2;
      a.actiontype = type;
      a.onclick = function(e) {
        for(var i = 0; i < action[type].length; i++) {
          var cs = action[this.actiontype][i].getElementsByTagName('input');
          cs[this.col].checked = true;
        }
      }
      td.appendChild(a);
    }

    actionrow.appendChild(td);
  }

  var table = document.getElementById('permissions');
  table = table.getElementsByTagName('tbody')[0];
  table.insertBefore(actionrow, node.parentElement.nextElementSibling);
}

makeCollapsible();