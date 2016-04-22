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

    this.beforeFixPosition = new THREE.Vector3();
    this.afterFixPosition = new THREE.Vector3();
	
	this.beforeFixLeftChild = null;
	this.beforeFixRightChild = null;
	
	this.isBeingRotated = false;
};

app.AVLTreeNode.prototype.circleGeometry = new THREE.CircleGeometry(30, 32);

app.AVLTreeNode.prototype.setBeforeFixPosition = function(treeHeight, nodeDepth, nodeLeftPos) {
    var numberOfNodesAtDepth = Math.pow(2, nodeDepth);

    this.beforeFixPosition.x = (nodeLeftPos - (numberOfNodesAtDepth - 1) / 2) * (this.width * Math.pow(2, treeHeight - nodeDepth));
    this.beforeFixPosition.y = -nodeDepth * this.width;
    this.beforeFixPosition.z = 0;

    this.beforeFixPosition.x = this.node.position.x;
    this.beforeFixPosition.y = this.node.position.y;
    this.beforeFixPosition.z = this.node.position.z;
	
	this.beforeFixLeftChild = this.leftChild;
	this.beforeFixRightChild = this.rightChild;
};

app.AVLTreeNode.prototype.setAfterFixPosition = function(treeHeight, nodeDepth, nodeLeftPos) {
    var numberOfNodesAtDepth = Math.pow(2, nodeDepth);

    this.afterFixPosition.x = (nodeLeftPos - (numberOfNodesAtDepth - 1) / 2) * (this.width * Math.pow(2, treeHeight - nodeDepth));
    this.afterFixPosition.y = -nodeDepth * this.width;
    this.afterFixPosition.z = 0;
};

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

app.AVLTreeNode.prototype.update = function(alpha) {
    this.node.position.lerpVectors(this.beforeFixPosition, this.afterFixPosition, alpha);
	
	if (alpha >= 0.05 && alpha <= 0.95) {
		if (this.leftChild == this.beforeFixLeftChild && this.leftChild) {
			this.leftLine.visible = true;
			
			this.leftLine.geometry.vertices = [this.node.position, this.leftChild.node.position];
			this.leftLine.geometry.verticesNeedUpdate = true;
		}
		else {
			this.leftLine.visible = false;
		}
		if (this.rightChild == this.beforeFixRightChild && this.rightChild) {
			this.rightLine.visible = true;
			
			this.rightLine.geometry.vertices = [this.node.position, this.rightChild.node.position];
			this.rightLine.geometry.verticesNeedUpdate = true;

		}
		else {
			this.rightLine.visible = false;
		}
	}

	if (alpha < 0.05) {
		if (this.beforeFixLeftChild) {
			this.leftLine.visible = true;
			this.leftLine.geometry.vertices = [this.node.position, this.beforeFixLeftChild.node.position];
			this.leftLine.geometry.verticesNeedUpdate = true;
		} 
		else {
			this.leftLine.visible = false;
		}
		if (this.beforeFixRightChild) {
			this.rightLine.visible = true;
			this.rightLine.geometry.vertices = [this.node.position, this.beforeFixRightChild.node.position];
			this.rightLine.geometry.verticesNeedUpdate = true;
		}
		else {
			this.rightLine.visible = false;
		}
	}
	if (alpha > 0.95) {
		if (this.leftChild) {
			this.leftLine.visible = true;
			this.leftLine.geometry.vertices = [this.node.position, this.leftChild.node.position];
			this.leftLine.geometry.verticesNeedUpdate = true;
		} 
		else {
			this.leftLine.visible = false;
		}
		if (this.rightChild) {
			this.rightLine.visible = true;
			this.rightLine.geometry.vertices = [this.node.position, this.rightChild.node.position];
			this.rightLine.geometry.verticesNeedUpdate = true;
		}
		else {
			this.rightLine.visible = false;
		}
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
