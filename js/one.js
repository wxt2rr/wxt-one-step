var TITLE_LENGTH_LIMIT = 22;
var favicon_url_regex = /localhost/i;
var tab_list = [];

// labels
var $active_label = $('<span class="label label-default">current</span>');

// tab functions

function close_all_tabs(){
  chrome.tabs.query({
    currentWindow: true
  }, function(tabs){
      var i;
      var tabs_ids = [];

      for(i = 0; i < tabs.length; i++){
        tabs_ids.push(tabs[i].id);
      }
      chrome.tabs.remove(tabs_ids);
  });
  update_total_tabs_count();
}

function update_total_tabs_count(){
  $('#tabs_count').text($('ul#tabs li').length);
}

function go_to_tab(tab_id){
  chrome.tabs.update(tab_id, {
    active: true
  }, function(tab_updated){
    console.log('tab updated: ' + tab_id);
  });
}

function close_tab(tab_id){
  chrome.tabs.get(tab_id, function(tab){
    tab_title = tab.title;
    chrome.tabs.remove(tab.id);
  });

  setTimeout(function(){
    $('#alert_success').fadeOut();
  }, 5000);
}

// list creation functions

function add_favicon(li, favicon_url){
  favicon = $('<img />');

  if(favicon_url === undefined || favicon_url_regex.exec(favicon_url))
    favicon_url = "page.png";

  favicon.attr({src: favicon_url, id: 'favicon'});

  li.append(favicon);
}

function get_tab_title(tab_title){
  title = tab_title;
  if(tab_title.length > TITLE_LENGTH_LIMIT)
    title = tab_title.substring(0, TITLE_LENGTH_LIMIT) + '...';
  return title;
}

function add_title(link, tab_title){
  title = get_tab_title(tab_title);
  link.append(title);
}

function add_link(li, tab_id, tab_title){
  link = $('<a></a>');
  link.attr({href: '#', id: tab_id});
  add_title(link, tab_title);
  li.append(link);
}

function add_label(li, tab){
  if(tab.active === true)
    li.append($active_label);
}

function add_close_button(li, tab_id){
  var button = $('<button>close</button>');
  button.attr({class: 'btn btn-warning btn-large', id: tab_id, style: 'float: right;top:1px', title: 'Close tab'});

  button.click(function(){
    close_tab(tab_id);
    li.remove();
    update_total_tabs_count();
  });

  li.append(button);
}

function create_tab_link(tab){
  ul = $('ul#tabs');

  li = $('<li></li>');
  li.attr({class: 'list-group-item'});

  add_favicon(li, tab.favIconUrl);
  add_link(li, tab.id, tab.title);
  add_label(li, tab);
  add_close_button(li, tab.id);

  ul.append(li);

  $("ul#tabs li a").on("click", function(){
      tab_id = parseInt($(this).attr('id'));
      go_to_tab(tab_id);
  });
}

function sortBy(attr,rev){
  //第二个参数没有传递 默认升序排列
    if(rev ==  undefined){
        rev = 1;
    }else{
        rev = (rev) ? 1 : -1;
    }
    
    return function(a,b){
        a = a[attr];
        b = b[attr];
        if(a < b){
            return rev * -1;
        }
        if(a > b){
            return rev * 1;
        }
        return 0;
    }
}

// Search functions
function filter_list(condition) {
  $("#tabs li").remove();

  tab_list.sort(sortBy("title", true)).filter(function (t) {
    return condition(t);
  }).forEach(function (t) {
    create_tab_link(t);
  });
}
function search_in_tabs(argument) {
  var reg = new RegExp(argument, "gi");
  filter_list(function (t) {
    return t.url.match(reg) || t.title.match(reg);
  });
}

function filter_tab_by(type) {
  filter_list(function (t) {
    return t[type];
  });
}

$(document).ready(function(){
  chrome.tabs.query({
    currentWindow: true
  }, function(tabs) {
    tab_list = tabs;

    for(var i = 0; i < tabs.length; i++){
      tab = tabs[i];
      create_tab_link(tab);
    }

    $("#form-container").on("keyup", "input", function () {
      search_in_tabs($(this).val());
      update_total_tabs_count();
    });

    $("#filter-list").on("click", "span", function (){
      filter_tab_by($(this).data("type"));
      update_total_tabs_count();
    });

    $("ul#tabs li a").on("click", function(){
      tab_id = parseInt($(this).attr('id'));
      go_to_tab(tab_id);
      update_total_tabs_count();
    });

    $('#btn-close-all-tabs').on("click", function(){
      close_all_tabs();
      update_total_tabs_count();
    });
    update_total_tabs_count();
  });
});
