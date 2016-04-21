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

