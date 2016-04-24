var app = app || { };

app.AVLTree = function() {
    this.root = null;
    this.object = new THREE.Object3D();
    this.isAnimating = false;
    this.currentTime = 0;
};

app.AVLTree.prototype.ROTATE_ANIMATION_TIME = 1.0; 
app.AVLTree.prototype.INSERT_ANIMATION_TIME = 1.0;

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
        return;
    }

    if (this.currentTime > this.ROTATE_ANIMATION_TIME + this.INSERT_ANIMATION_TIME) {
        this.isAnimating = false;
        this.updateHelper(this.root, 1.0);
        return;
    }

    this.currentTime += dt;

    this.updateHelper(this.root, this.currentTime / (this.ROTATE_ANIMATION_TIME + this.INSERT_ANIMATION_TIME));
};

app.AVLTree.prototype.updateHelper = function(node, alpha) {
    if (!node) {
        return;
    }

    node.update(alpha);

    this.updateHelper(node.leftChild, alpha);
    this.updateHelper(node.rightChild, alpha);
};

app.AVLTree.prototype.setAllNotBeingInserted = function(node) {
    if (!node) {
        return;
    }

    node.insertPositions = null;

    this.setAllNotBeingInserted(node.leftChild);
    this.setAllNotBeingInserted(node.rightChild);
}

app.AVLTree.prototype.insert = function(key) {
    if (this.isAnimating) {
        return;
    }
    if (!key || key == "") {
        return;
    }
    
    this.setAllNotBeingInserted(this.root);
    this.updateHelper(this.root, 1.0);
    
    this.currentTime = 0;

    if (this.root === null) {
        // Insert first node into the tree
        this.root = new app.AVLTreeNode(key);
        this.object.add(this.root.object);
        return;
    }

    var insertPositions = [];

    var currentNode = this.root;

    while (true) {
        insertPositions.push(currentNode.node.position);

        if (currentNode.key > key) {
            if (currentNode.leftChild === null) {
                // Create new node and add it to the tree
                currentNode.leftChild = new app.AVLTreeNode(key);
                currentNode.leftChild.parent = currentNode;
                insertPositions.push(new THREE.Vector3(currentNode.node.position.x - currentNode.width,
                                                       currentNode.node.position.y - currentNode.width,
                                                       0.0));
                currentNode.leftChild.insertPositions = insertPositions;

                this.object.add(currentNode.leftChild.object);

                this.setBeforeFixPositions(this.root, 0, 0);
                this.fixTree(currentNode.leftChild);
                this.setAfterFixPositions(this.root, 0, 0);
                break;
            }
            currentNode = currentNode.leftChild;
        }
        else {
            if (currentNode.rightChild === null) {
                // Create new node and add it to the tree
                currentNode.rightChild = new app.AVLTreeNode(key);
                currentNode.rightChild.parent = currentNode;
                insertPositions.push(new THREE.Vector3(currentNode.node.position.x + currentNode.width,
                                                       currentNode.node.position.y - currentNode.width,
                                                       0.0));
                currentNode.rightChild.insertPositions = insertPositions;

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
    var y = x.leftChild;
    var z = y.rightChild;

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
