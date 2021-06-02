const delay = ms => new Promise(res => setTimeout(res, ms));
var cy = cytoscape({
    container: document.getElementById('cy'),
  
    boxSelectionEnabled: false,
    autounselectify: true,
  
    style: cytoscape.stylesheet()
      .selector('node')
        .style({
          'content': 'data(id)',
          'label-color': 'red'
        })
      .selector('edge')
        .style({
          'curve-style': 'bezier',
          'width': 4,
          'line-color': '#ddd',
        })
      .selector('.highlighted')
        .style({
          'background-color': '#61bffc',
          'line-color': '#61bffc',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        })
      .selector('.unloaded')
        .style({
          'background-color': '#ff00ff',
          'line-color': '#ff00ff',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        })
      .selector('.running')
        .style({
          'background-color': '#ffff00',
          'line-color': '#ffff00',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        })
      .selector('.killed')
        .style({
          'background-color': '#ff0000',
          'line-color': '#ff0000',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        })
      .selector('.terminated')
        .style({
          'background-color': '#00ff00',
          'line-color': '#00ff00',
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'
        }),
  
    elements: {
        nodes: [
          { data: { id: 'a', status: 'u', kids: 0 } },
          { data: { id: 'b', status: 'u', kids: 0 } },
          { data: { id: 'c', status: 'u', kids: 0 } },
          { data: { id: 'd', status: 'u', kids: 0 } },
          { data: { id: 'e', status: 'u', kids: 0 } },
          { data: { id: 'f', status: 'u', kids: 0 } },
          { data: { id: 'g', status: 'u', kids: 0 } },
          { data: { id: 'h', status: 'u', kids: 0 } },
          { data: { id: 'i', status: 'u', kids: 0 } },
          { data: { id: 'j', status: 'u', kids: 0 } },
        ],
  
        edges: [
          {data: {id: 'ab', source: 'a', target: 'b'}},
          {data: {id: 'ac', source: 'a', target: 'c'}},
          {data: {id: 'bd', source: 'b', target: 'd'}},
          {data: {id: 'be', source: 'b', target: 'e'}},
          {data: {id: 'bf', source: 'b', target: 'f'}},
          {data: {id: 'ei', source: 'e', target: 'i'}},
          {data: {id: 'cg', source: 'c', target: 'g'}},
          {data: {id: 'ch', source: 'c', target: 'h'}},
          {data: {id: 'hj', source: 'h', target: 'j'}}
        ]
      },
  
    layout: {
      name: 'breadthfirst',
      directed: false,
      roots: '#a',
      padding: 10
    }
  });

  function conVx(root, tgstatus){
    conVxs = [];
    console.log("At conVx("+root+", "+tgstatus+");");
    var adj = cy.getElementById(root).connectedEdges();
    for (var i = 0; i < adj.length; i++) {
      var conn = adj[i].connectedNodes();
      var vxa = conn[0].data('id');
      var vxb = conn[1].data('id');
      console.log(vxa+' '+vxb);
      if (vxa != root) {
        if (cy.getElementById(vxa).data('status') == tgstatus) {
          conVxs.push(vxa);
          console.log("Chose vxa");
        }
        else console.log("Chose nothing");
      }
      else if (vxb != root) if (cy.getElementById(vxb).data('status') == tgstatus) {
        conVxs.push(vxb);
        console.log("Chose vxb");
      }
      else 
      console.log("Chose none");
    }

    console.log("The conVx function will return "+conVxs);
    return conVxs;
  }

  async function djxsch (root){
    if (cy.nodes().getElementById(root).data('status') == 'u') {
      
      await delay(5000);
      //if unloaded, load it
      console.log("At node "+root);
      cy.nodes().getElementById(root).data('status', 's');
      console.log("Now data in "+root+" is "+cy.nodes().getElementById(root).data('status'));
      cy.nodes().getElementById(root).addClass('running'); 
      console.log("Started node "+root);

      //go to child processes
      var children = conVx(root, 'u');
      cy.nodes().getElementById(root).data('kids', children.length);
      console.log("Children are "+children);
      for (var i = 0; i < children.length; i++) {
        console.log("On to child "+children[i]);
        djxsch(children[i]);
        
        await delay(5000);
      }

      //returning from children, killing process
      cy.nodes().getElementById(root).data('status', 'k');
      console.log("Now data in "+root+" is "+cy.nodes().getElementById(root).data('status'));
      cy.nodes().getElementById(root).addClass('killed');
      console.log("Killed node "+root); 

      //returning if it is a leaf, killing its parent
      if (children.length == 0) {
        console.log("Node "+root+" is a leaf");
        await delay(5000);
        //Terminating leaf
        cy.nodes().getElementById(root).data('status', 't');
        cy.nodes().getElementById(root).addClass('terminated');

        var runprt = conVx(root, 's');
        var kilprt = conVx(root, 'k');
        parent = runprt.concat(kilprt);
        console.log("Parents of "+root+" are "+parent);
        for (var i = 0; i < parent.length; i++) {
          console.log("On to dad "+root);
          djxsch(parent[i]);
          await delay(5000);
        }
      }
    }
    else if (cy.nodes().getElementById(root).data('status') != 't') {      
      console.log("At node again"+root);
      await delay(5000);

      if (cy.nodes().getElementById(root).data('kids') > 0) {
        console.log("Node root had "+cy.nodes().getElementById(root).data('kids')+"kids alive");
        var hadkids = cy.nodes().getElementById(root).data('kids');
        cy.nodes().getElementById(root).data('kids', hadkids-1);
        console.log("Node root now has "+cy.nodes().getElementById(root).data('kids')+"kids alive");
      }

      if (cy.nodes().getElementById(root).data('kids') == 0) {
        cy.nodes().getElementById(root).data('status', 't');
        cy.nodes().getElementById(root).addClass('terminated');
        
        //Evoking parent
        runprt = conVx(root, 's');
        kilprt = conVx(root, 'k');
        parent = runprt.concat(kilprt);
        for (var i = 0; i < parent.length; i++) {
          console.log("On to dad "+root);
          djxsch(parent[i]);
          await delay(5000);
        }
      }
    }
  }

  djxsch('a');
  