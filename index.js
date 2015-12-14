/**
 * Use nodejs local cache to add block support for view engines.
 */


//
// Block class - essentially an HTML buffer
//

function Block(name) {
  this.name = name;
  // list of scopes defined in tpls, in order to render block htmls in order
  // this.tplScopes = [];    
  // map from view to list of htmls
  this.htmls = {};    
}

Block.prototype.addHtml = function (scopeName, html, ignoreOtherScope) {
  if(this.ignoreOtherScope && this.onlyoneScope !== scopeName)
    return false;

  // if we haven't seen this scopeName before, add it:
  if (!this.htmls[scopeName]) {
    // this.tplScopes.push(scopeName);
    this.htmls[scopeName] = [];
  }

  // then add this html for this view:
  this.htmls[scopeName].push(html);

  // Haven't added ignoreOtherScope before
  if(!this.ignoreOtherScope && ignoreOtherScope) {
    this.ignoreOtherScope = ignoreOtherScope;
    this.onlyoneScope = scopeName;
    // console.log('this.onlyoneScope: ', scopeName);
    // remove other scope htmls that have added before
    for(var i in this.htmls) {
      if (i != scopeName) {
        delete this.htmls[i];
      }
    }
  }

  // console.log(this.tplScopes)
  // { list: [ '管理后台 - 成员列表' ], base: [ '管理首页' ] }
  // { list: [ '{{base}} - 成员列表' ], base: [ '管理首页' ] }
  // console.log(this.htmls)
}

Block.prototype.toHtml = function () {
  var output = [];
  var htmls = this.htmls;
  
  // Replace interpolation scope
  // { list: [ '{{base}} - 成员列表' ], base: [ '管理首页' ] }
  var k = Object.keys(htmls);
  k.forEach(function (scope) {
    // maybe is deleted key
    if(!htmls[scope])
      return false;

    // var html = htmls[scope].join('')
    htmls[scope].forEach(function(html, idx) {

      k.forEach(function (scopeII) {

        var pattern = '{{' + scopeII + '}}';
        if(html.indexOf(pattern) > -1) {
          htmls[scope][idx] = html.replace('{{' + scopeII + '}}', htmls[scopeII].join('') );
          delete htmls[scopeII];
        }

      })

    })
  });

  // important: we want to output HTML in reverse order of views, since
  // child views are rendered before parent views, but *within* a view,
  // we want to output HTML in the order given.
  Object.keys(htmls).reverse().forEach(function (scope) {
    var html = htmls[scope].join('')
    output.push(html);
  });
  
  // console.log(output)
  return output.join('');
};

// important: so that the block can be output in the view directly w/out
// having to explicitly call .toHtml() on it.
Block.prototype.toString = Block.prototype.toHtml;


//
// Middleware - adds view helpers to every request
//

module.exports = function() {
  return function bmExpressBlock(req, res, next) {
    // request-local hash of named blocks
    var resLocalBlocks = {};

    // create the named block if it doesn't already exist
    function getResLocalBlock(name) {
      return resLocalBlocks[name] = resLocalBlocks[name] || new Block(name);
    }

    // setBlock(name, scope, html) adds the given HTML to the named block
    res.locals.setBlock = function setBlock(name, scope, html, ignoreOtherScope) {
      var blockInstance = getResLocalBlock(name);

      if (html) {
        blockInstance.addHtml(scope, html, ignoreOtherScope);
      }
    }

    res.locals.blocks = resLocalBlocks;
    
    next();
  }
};
