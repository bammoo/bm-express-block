# bm-express-block
Express middleware for using html or text block in views, support ejs jade etc. view engines.

# Examples

## Basic

You can view example code [here](https://github.com/bammoo/express-ejs-block-example/tree/master/views).

**layout.ejs**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <%- setBlock('title', 'base', 'Myapp - ') %>
    <title><%- blocks.title %></title>
    <%- blocks.header %>
  </head>
  <body>
    <%- body %>

    <%- blocks.footer %>
  </body>
</html>
```

**index.ejs**

```
<%- setBlock('title', 'index', 'Site Home') %>

<h1>My Site</h1>
<p>Welcome to My Site</p>
```

**user.ejs**

`{{base}}` is used for inherit block html content of parent template.

E.g. `{{base}}User` will output 'Myapp - ' set by layout.ejs before 'User', so the whole output is 'Myapp - User'.

```
<%- setBlock('title', 'user', '{{base}}User') %>

<h1>users</h1>

<%- setBlock('footer', 'user',
  '<script>var userId = ' + id + ';</script>' +
  '<script src="/js/user.js"></script>'
  ) %>
```

# Usage

## Installation

```shell
npm install bm-express-block --save-dev
```

## Use in your Expressjs application

```js
// Require it
var bmExpressBlock = require('bm-express-block');

var app = express();
// Add this line after you create instance of Expressjs
app.use(bmExpressBlock());
```

# Api

 
## blocks
`<%- blocks.name %>` 

View object for outputting named block html


## setBlock()
`<%-setBlock(name, scope, html) %>` 

View method for adding the given HTML to the named block


## Release History

* 2015-12-13   v1.1.0   Change init method, update doc
* 2015-07-31   v1.0.0   Initial commit


