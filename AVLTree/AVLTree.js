var app = app || { };

app.AVLTree = function() {
    this.root = null;
    this.object = new THREE.Object3D();
    this.isAnimating = false;
    this.currentTime = 0;
};

app.AVLTree.prototype.ANIMATION_TIME = 1.0; 

app.AVLTree.prototype.setBeforeFixPositions = function(node, depth, leftPos) {
    if (!node) {
        return;
    }

    node.setBeforeFixPosition(this.root.height, depth, leftPos);

    this.setBeforeFixPositions(node.leftChild, depth + 1, leftPos * 2);
    this.setBeforeFixPositions(node.rightChild, depth + 1, leftPos * 2 + 1);
};

app.AVLTree.prototype.setAfterFixPositions = function(node, depth, leftPos) {
    if (!node) {
        return;
    }

    node.setAfterFixPosition(this.root.height - 1, depth, leftPos);

    this.setAfterFixPositions(node.leftChild, depth + 1, leftPos * 2);
    this.setAfterFixPositions(node.rightChild, depth + 1, leftPos * 2 + 1);
};

app.AVLTree.prototype.update = function(dt) {
    if (!this.isAnimating) {
        this.currentTime = 0;
        return;
    }

    //console.log("ANIMATING");

    if (this.currentTime > this.ANIMATION_TIME) {
        this.isAnimating = false;
        return;
    }

    this.currentTime += dt;

    this.updateHelper(this.root, this.currentTime / this.ANIMATION_TIME);
};

app.AVLTree.prototype.updateHelper = function(node, alpha) {
    if (!node) {
        return;
    }

    node.update(alpha);

    this.updateHelper(node.leftChild, alpha);
    this.updateHelper(node.rightChild, alpha);
};

app.AVLTree.prototype.insert = function(key) {
    if (this.isAnimating) {
        return;
    }

    if (this.root === null) {
        // Insert first node into the tree
        this.root = new app.AVLTreeNode(key);
        this.object.add(this.root.object);
        return;
    }

    var currentNode = this.root;
    var insertDepth = 0;
    var insertLeftPos = 0;

    while (true) {
        insertDepth++;

        if (currentNode.key > key) {
            insertLeftPos = insertLeftPos * 2;
            if (currentNode.leftChild === null) {
                // Create new node and add it to the tree
                currentNode.leftChild = new app.AVLTreeNode(key);
                currentNode.leftChild.parent = currentNode;

                currentNode.leftChild.node.position.x = currentNode.node.position.x - currentNode.width;
                currentNode.leftChild.node.position.y = currentNode.node.position.y - currentNode.width;

                this.object.add(currentNode.leftChild.object);

                this.setBeforeFixPositions(this.root, 0, 0);
                this.fixTree(currentNode.leftChild);
                this.setAfterFixPositions(this.root, 0, 0);
                break;
            }
            currentNode = currentNode.leftChild;
        }
        else {
            insertLeftPos = insertLeftPos * 2 + 1;
            if (currentNode.rightChild === null) {
                // Create new node and add it to the tree
                currentNode.rightChild = new app.AVLTreeNode(key);
                currentNode.rightChild.parent = currentNode;

                currentNode.rightChild.node.position.x = currentNode.node.position.x + currentNode.width;
                currentNode.rightChild.node.position.y = currentNode.node.position.y - currentNode.width;

                this.object.add(currentNode.rightChild.object);

                this.setBeforeFixPositions(this.root, 0, 0);
                this.fixTree(currentNode.rightChild);
                this.setAfterFixPositions(this.root, 0, 0);
                break;
            }
            currentNode = currentNode.rightChild;
        }
    }
};

app.AVLTree.prototype.fixTree = function(node) {
    var z = node;
    var y = z.parent;

    if (!y) {
        return;
    }

    y.recalculateHeight();

    var x = y.parent;

    while (x) {
        x.recalculateHeight();
        
        if (Math.abs(x.getBalanceFactor()) >= 2) {
            if (x.leftChild == y && y.leftChild == z) {
                this.rightRotate(x);
            } 
            else if (x.leftChild == y && y.rightChild == z) {
                this.leftRotate(y);
                this.rightRotate(x);
            } 
            else if (x.rightChild == y && y.rightChild == z) {
                this.leftRotate(x);
            } 
            else if (x.rightChild == y && y.leftChild == z) {
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
    if (x.parent) {
        if (x.parent.leftChild == x) {
            x.parent.leftChild = y;
        } 
        else {
            x.parent.rightChild = y;
        }
    }

    x.parent = y;
    y.rightChild = x;

    if (z) {
        z.parent = x;
    }
    x.leftChild = z;

    if (this.root == x) {
        this.root = y;
    }

    x.recalculateHeight();
    y.recalculateHeight();
    if (y.parent) {
        y.parent.recalculateHeight();
    }
};

app.AVLTree.prototype.leftRotate = function(x) {
    var y = x.rightChild;
    var z = y.leftChild;

    y.parent = x.parent; 
    if (x.parent) {
        if (x.parent.leftChild == x) {
            x.parent.leftChild = y;
        } 
        else {
            x.parent.rightChild = y;
        }
    }

    x.parent = y;
    y.leftChild = x;

    if (z) {
        z.parent = x;
    }
    x.rightChild = z;

    if (this.root == x) {
        this.root = y;
    }

    x.recalculateHeight();
    y.recalculateHeight();
    if (y.parent) {
        y.parent.recalculateHeight();
    }
};
