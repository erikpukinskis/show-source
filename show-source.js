var library = require("module-library")(require)


module.exports = library.export(
  "show-source",
  ["render-expression", "make-request", "web-element", "browser-bridge", "an-expression", "bridge-module", "./boot-module", "web-element", "basic-styles", "tell-the-universe", "javascript-to-ezjs"],
  function(renderExpression, makeRequest, element, BrowserBridge, anExpression, bridgeModule, bootModule, element, basicStyles, tellTheUniverse, javascriptToEzjs) {

    function showSource(bridge, moduleName, lib) {

      basicStyles.addTo(bridge)

      var contentPartial = bridge.partial()

      var singleton = lib.get(moduleName)

      singleton(contentPartial)

      var universe = tellTheUniverse.called("demo-module").withNames({anExpression: "an-expression"})

      var source = lib.getSource(moduleName)

      var tree = anExpression.tree(moduleName)

      universe("anExpression.tree", moduleName)

      tree.logTo(universe)

      javascriptToEzjs(source, tree)

      var contentSelector = contentPartial.selector()

      var editor = bridge.partial()

      var boot = bridgeModule(lib, "./boot-module", bridge)

      renderExpression(editor, tree.root(), tree)

      editor.domReady(
        boot.withArgs(
          moduleName,
          tree.id,
          contentSelector,
          bridge.asBinding(),
          renderExpression.defineOn(bridge)
        )
      )


      bridge.asap("var using = library.using.bind(library)")

      prepareSite(bridge.getSite(), lib)

      var title = element("h2", element.style({
        "text-transform": "capitalize",
        "color": "#a9a9ff",
        "margin-left": "-0.03em",
      }), dedasherize(moduleName))

      var stylesheet = element.stylesheet([

        element.style("h2", {
          "font-weight": "normal",
          "font-family": "sans-serif",
          "font-size": "1.8em",
          "margin": "0.5em 0",
        }),

        element.style(".log", {
          "background-color": "#ffffee"
        }),

        element.style(".log h2", {
          "color": "#fc0",
        }),

        element.style(".universe-title", {
          "font-weight": "bold",
        }),

        element.style(".column", {
          "display": "inline-block",
          "width": "250px",
          "vertical-align": "top",
          "margin-right": "20px",

          ".squished": {
            "width": "0px",
          },
        }),

        element.style(".page", {
          "margin-top": "150px",
          "margin-left": "30px",
        }),
      ])

      bridge.addToHead(stylesheet)


      var page = element(".page", [
        element(
          ".column",
          [contentPartial]
        ),
        element(
          ".editor.column",
          [title, editor]
        ),
        element(".log.column.squished"),
      ])

      bridge.send(page)
    }

    function dedasherize(id) {
      return id.replace(/-/g, " ")
    }

    showSource.button = function(targetVoxel, singleton) {

      prepareBridge(targetVoxel)

      targetVoxel.send("loading...")

      var moduleName = singleton.__nrtvModule.name

      var load = targetVoxel.remember("show-source/loadCode").withArgs(moduleName)

      var showSourceButton = element(
        "button",
        {onclick: targetVoxel.toggle().withArgs(load).evalable()},
        "Show source"
      )

      return showSourceButton

    }

    function prepareSite(site, lib) {
      
      if (site.remember("show-source")) { return }

      site.addRoute("get", "/show-source/partials/:moduleName", function(request, response) {

        var name = request.params.moduleName

        var bridge = new BrowserBridge().partial().forResponse(response)

        lib.using([name], function(singleton) {
          var module = singleton.__nrtvModule

          showSource(bridge, module.func.toString(), module.name)
        })  

      })

      site.addRoute(
        "get",
        "/library/:name.js",
        function(request, response) {
          var name = request.params.name

          if (name.match(/[^a-z-]/)) {
            throw new Error("Dependencies can only have lowercase letters and dash. You asked for "+name)
          }

          var bridge = new BrowserBridge()

          var source = bridgeModule.definitionWithDeps(library, name, bridge)

          response.setHeader('content-type', 'text/javascript')

          response.send(source)
        }
      )

      site.see("show-source", true)
    }

    function prepareBridge(bridge, lib) {
      if (bridge.remember("show-source")) { return }

      prepareSite(bridge.getSite(), lib)

      var loadCode = bridge.defineFunction(
        [makeRequest.defineOn(bridge)],
        function loadCode(makeRequest, moduleName, voxel) {
          if (voxel.wasLoaded) { return }

          makeRequest("/show-source/partials/"+moduleName, function(html) {
            voxel.send(html)
          })

          voxel.wasLoaded = true
        }
      )

      bridge.addToHead(
        element.stylesheet(
          element.style("button", {
            "padding": "10px",
            "font-size": "1em",
            "border": "0",
            "background": "#e91e63",
            "color": "white",
          })
        )
      )

      bridge.see("show-source/loadCode", loadCode)
    }

    showSource.prepareSite = prepareSite


    return showSource
  }
)
