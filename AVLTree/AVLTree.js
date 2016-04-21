var app = app || { };

app.AVLTreeNode = function(key) {
    this.key = key;
    this.parent = null;
    this.leftChild = null;
    this.rightChild = null;
    this.height = 1;

    this.width = 70;

    this.node = new THREE.Mesh(this.circleGeometry, new THREE.MeshBasicMaterial({color: 0xffffff}));

    this.leftLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xffffff}));
    this.rightLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xffffff}));

    this.leftLine.visible = false;
    this.rightLine.visible = false;

    this.leftLine.position.z = -0.5;
    this.rightLine.position.z = -0.5;

    this.object = new THREE.Object3D();
    this.object.add(this.node);
    this.object.add(this.leftLine);
    this.object.add(this.rightLine);

    this.textDiv = document.createElement('div');
    this.textDiv.style.textAlign = "center";
    this.textDiv.style.color = "black";
    this.textDiv.style.position = 'absolute';
    this.textDiv.style.width = (this.width - 10) + 'px';
    this.textDiv.style.height = (this.width - 10) + 'px';
    this.textDiv.style.lineHeight = (this.width - 10) + 'px';
    this.textDiv.innerHTML = this.key;
    document.body.appendChild(this.textDiv);
};

app.AVLTreeNode.prototype.circleGeometry = new THREE.CircleGeometry(30, 32);

app.AVLTreeNode.prototype.recalculateHeight = function() {
    var leftHeight = 0;
    if (this.leftChild) {
        leftHeight = this.leftChild.height;
    }

    var rightHeight = 0;
    if (this.rightChild) {
        rightHeight = this.rightChild.height;
    }

    if (leftHeight > rightHeight) {
        this.height = leftHeight + 1;
    }
    else {
        this.height = rightHeight + 1;
    }
};

app.AVLTreeNode.prototype.getBalanceFactor = function() {
    var leftHeight = 0;
    if (this.leftChild) {
        leftHeight = this.leftChild.height;
    }

    var rightHeight = 0;
    if (this.rightChild) {
        rightHeight = this.rightChild.height;
    }

    return leftHeight - rightHeight;
};

app.AVLTreeNode.prototype.updateObject = function(treeHeight, nodeDepth, nodeLeftPos) {
    var numberOfNodesAtDepth = Math.pow(2, nodeDepth);

    this.node.position.x = (nodeLeftPos - (numberOfNodesAtDepth - 1) / 2) * (this.width * Math.pow(2, treeHeight - nodeDepth));
    this.node.position.y = -nodeDepth * this.width;

    if (this.leftChild) {
        this.leftLine.visible = true;
        this.leftLine.geometry.vertices = [this.object.children[0].position, this.leftChild.object.children[0].position];
        this.leftLine.geometry.verticesNeedUpdate = true;
    }
    else {
        this.leftLine.visible = false;
    }
    if (this.rightChild) {
        this.rightLine.visible = true;
        this.rightLine.geometry.vertices = [this.object.children[0].position, this.rightChild.object.children[0].position];
        this.rightLine.geometry.verticesNeedUpdate = true;
    }
    else {
        this.rightLine.visible = false;
    }

    var screenPosition = new THREE.Vector3();
    screenPosition.set(this.node.position.x - this.width / 2, this.node.position.y + 200 + this.width / 2, 0.0);

    // map to normalized device coordinate (NDC) space
    screenPosition.project(app.camera);

    // map to 2D screen space
    screenPosition.x = Math.round((screenPosition.x + 1 ) * window.innerWidth / 2);
    screenPosition.y = Math.round((-screenPosition.y + 1) * window.innerHeight / 2);

    this.textDiv.style.top = (screenPosition.y + 5) + 'px';
    this.textDiv.style.left = (screenPosition.x + 5) + 'px';
};

app.AVLTree = function() {
    this.root = null;
    this.height = 0;

    this.object = new THREE.Object3D();
};

app.AVLTree.prototype.updateNodePositions = function(node, depth, leftPos) {
    if (!node) {
        return;
    }

    node.updateObject(this.root.height - 1, depth, leftPos);

    this.updateNodePositions(node.leftChild, depth + 1, leftPos * 2); 
    this.updateNodePositions(node.rightChild, depth + 1, leftPos * 2 + 1); 
};

app.AVLTree.prototype.insert = function(key) {
    if (this.root === null) {
        // Insert first node into the tree
        this.root = new app.AVLTreeNode(key);
        this.object.add(this.root.object);
        return;
    }

    var currentNode = this.root;
    var insertHeight = 0;

    while (true) {
        insertHeight++;

        if (currentNode.key > key) {
            if (currentNode.leftChild === null) {
                // Create new node and add it to the tree
                currentNode.leftChild = new app.AVLTreeNode(key);
                currentNode.leftChild.parent = currentNode;
                this.object.add(currentNode.leftChild.object);
                this.fixTree(currentNode.leftChild);

                // Fix up the trees height
                if (insertHeight > this.height) {
                    this.height = insertHeight;
                }
                break;
            }
            currentNode = currentNode.leftChild;
        }
        else {
            if (currentNode.rightChild === null) {
                // Create new node and add it to the tree
                currentNode.rightChild = new app.AVLTreeNode(key);
                currentNode.rightChild.parent = currentNode;
                this.object.add(currentNode.rightChild.object);
                this.fixTree(currentNode.rightChild);

                // Fix up the trees height
                if (insertHeight > this.height) {
                    this.height = insertHeight;
                }
                break;
            }
            currentNode = currentNode.rightChild;
        }
    }
};

app.AVLTree.prototype.fixTree = function(node) {
    var z = node;
    var y = z.parent;

    console.log("FIX TREE");

    if (!y) 
    {
        return;
    }

    y.recalculateHeight();

    var x = y.parent;

    while (x) 
    {
        console.log(x.getBalanceFactor());
        x.recalculateHeight();
        
        if (Math.abs(x.getBalanceFactor()) >= 2) 
        {
            if (x.leftChild == y && y.leftChild == z) 
            {
                this.rightRotate(x);
            } 
            else if (x.leftChild == y && y.rightChild == z) 
            {
                this.leftRotate(y);
                this.rightRotate(x);
            } 
            else if (x.rightChild == y && y.rightChild == z) 
            {
                this.leftRotate(x);
            } 
            else if (x.rightChild == y && y.leftChild == z) 
            {
                this.rightRotate(y);
                this.leftRotate(x);
            }

            break;
        }

        z = y;
        y = x;
        x = x.parent;
    }
};
    
app.AVLTree.prototype.rightRotate = function(x) {
    y = x.leftChild;
    z = y.rightChild;

    y.parent = x.parent; 
    if (x.parent) 
    {
        if (x.parent.leftChild == x) 
        {
            x.parent.leftChild = y;
        } 
        else 
        {
            x.parent.rightChild = y;
        }
    }

    x.parent = y;
    y.rightChild = x;

    if (z) 
    {
        z.parent = x;
    }
    x.leftChild = z;

    if (this.root == x) 
    {
        this.root = y;
    }

    x.recalculateHeight();
    y.recalculateHeight();
    if (y.parent) 
    {
        y.parent.recalculateHeight();
    }
};

app.AVLTree.prototype.leftRotate = function(x) {
    var y = x.rightChild;
    var z = y.leftChild;

    y.parent = x.parent; 
    if (x.parent) 
    {
        if (x.parent.leftChild == x) 
        {
            x.parent.leftChild = y;
        } 
        else 
        {
            x.parent.rightChild = y;
        }
    }

    x.parent = y;
    y.leftChild = x;

    if (z) 
    {
        z.parent = x;
    }
    x.rightChild = z;

    if (this.root == x) 
    {
        this.root = y;
    }

    x.recalculateHeight();
    y.recalculateHeight();
    if (y.parent) 
    {
        y.parent.recalculateHeight();
    }
};
