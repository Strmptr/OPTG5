
var container;
var camera, scene, renderer,cameraOrtho,sceneOrtho;
var cursor3D;
var geometry,mas;
var spotlight = new THREE.PointLight(0xaaff00,8,100,2);
var light = new THREE.DirectionalLight(0xffffff);
var sphere;
var N = 100;  
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var mouse = { x: 0, y: 0 }; //переменная для хранения координат мыши
//массив для объектов, проверяемых на пересечение с курсором
var targetList = []; 
var circle;
var radius=1;
var brushDirection=0;
//объект интерфейса и его ширина
var gui = new dat.GUI();
gui.width = 200;
var targetList=[];
var objectList=[];
var lastPos= new THREE.Vector3();
var brVis = false;

var objectList1=[];



var models= new Map();
var rayI = true;
var selected = null;
//var lmb = false;

var sprt = null;

var loader =  new THREE.TextureLoader();

var sprtBtn = [];

var xwind = 0;
var g = new THREE.Vector3(0, -1.8 , 0);
var wind = new THREE.Vector3(0.0, 0.0, 0.0);
var particles = [];
var MAX_PARTICLES = 1000;
var partVis = false;

var rainMat = null;

init();
animate();
 
function init()
{
    var width = window.innerWidth;
    var height = window.innerHeight;
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    sceneOrtho = new THREE.Scene();
    cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, -height / 2, 1, 10 );
    cameraOrtho.position.z = 10;

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );    
    camera.position.set(N/2, N/2, N*1.5); 
    camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));    


    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x444444, 1);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;


    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    renderer.autoClear = false;

    renderer.domElement.addEventListener('mousedown',onDocumentMouseDown,false);
    renderer.domElement.addEventListener('mouseup',onDocumentMouseUp,false);
    renderer.domElement.addEventListener('mousemove',onDocumentMouseMove,false);
    renderer.domElement.addEventListener('wheel',onDocumentMouseScroll,false);
    renderer.domElement.addEventListener("contextmenu",
                                                        function (event)
                                                            {
                                                                event.preventDefault();
                                                            });

   light.position.set(N*2, N*1.5, N*0.5 );
    // направление освещения
    light.target = new THREE.Object3D();
    light.target.position.set( 0, 5, 0 );
    scene.add(light.target);
    // включение расчёта теней
    light.castShadow = true;
    // параметры области расчёта теней
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 60, 1, 1, 2500 ) );
    light.shadow.bias = 0.0001;
    // размер карты теней
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    scene.add( light );
    var helper = new THREE.CameraHelper(light.shadow.camera);
    //scene.add(helper);
   
    scene.add(spotlight);
   
    CreateTerrain();
    addSky();
    add3DCursor();
    addCirkle();
    circle.scale.set(radius,1,radius);
    GUI();

    sprtBtn.push( addButtons('house') );
    sprtBtn.push( addButtons('grade') );
    
    loadModel('models/house/', "Cyprys_House.obj", "Cyprys_House.mtl",1,'house');
    loadModel('models/grade/', "grade.obj", "grade.mtl",1,'grade');
    rainMat = createSpriteMat('pics/drop.png');
}

 
function onWindowResize()
{
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
 

    
    cameraOrtho.left = -width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = -height / 2;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
    var delta = clock.getDelta();
    if (brushDirection!=0)
    {
        sphereBrush(brushDirection,delta);
    }
    for (var i = 0; i < objectList.length; i++)
    {
        objectList1[i].position.y = mas.vertices[Math.round(objectList1[i].position.z) + Math.round(objectList1[i].position.x)*N].y+0.3 ;
    }
   
    emitter(delta);
    requestAnimationFrame( animate );
    render();
}
function render()
{
    renderer.clear();
    renderer.render( scene, camera );
    renderer.clearDepth();
    renderer.render( sceneOrtho, cameraOrtho);
}
 
function CreateTerrain()
{
    mas = new THREE.Geometry();
 
    for (var i=0; i < N; i++)
        for (var j=0; j < N; j++)
        {
       
            mas.vertices.push(new THREE.Vector3( i, 0.0, j));
        }

    for(var i = 0; i < N - 1; i++){
        for(var j = 0; j < N - 1; j++){
            var vertex1 =  i + j * N;
            var vertex2 = (i + 1) + j * N;
            var vertex3 = i + (j + 1) * N;
            var vertex4 = (i + 1) + (j + 1) * N;

            mas.faces.push(new THREE.Face3(vertex1, vertex2, vertex4));
            mas.faces.push(new THREE.Face3(vertex1, vertex4, vertex3));

            mas.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))
            ]);

            mas.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),
                new THREE.Vector2(i/(N-1), (j+1)/(N-1))
            ]);
        } 
    }
        
    mas.computeFaceNormals();  
    mas.computeVertexNormals();

    var loader = new THREE.TextureLoader();
    var tex = loader.load( 'pics/grasstile.jpg' );
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    // Повторить текстуру 10х10 раз
    tex.repeat.set( 4,4 );
        
    var mat = new THREE.MeshLambertMaterial({    
        map: tex,    
        wireframe: false,    
        side: THREE.DoubleSide 
    });
 
    var matMesh = new THREE.Mesh(mas, mat); 
    matMesh.receiveShadow = true;
    targetList.push(matMesh);
   
    scene.add(matMesh);
} 
function addCirkle()
    {
        var material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
  
        var segments = 64;
        var circleGeometry = new THREE.CircleGeometry( radius, segments );
        //удаление центральной вершины
        circleGeometry.vertices.shift();

        for(var i=0;i<circleGeometry.vertices.length;i++)
        {
            circleGeometry.vertices[i].z=circleGeometry.vertices[i].y;
            circleGeometry.vertices[i].y=0;
        }

        circle = new THREE.Line( circleGeometry, material );
        circle.scale.set(radius,1,radius);
        circle.visible = false;
        scene.add( circle ); 
    }

function addSky()
    {
    //создание геометрии сферы
    var geometry = new THREE.SphereGeometry( 300, 32, 32 );
    //загрузка текстуры
    var loader = new THREE.TextureLoader();
    //создание материала
    var material = new THREE.MeshBasicMaterial({
    map: loader.load( "pics/sky-texture.jpg" ),
    side: THREE.DoubleSide
    });
    //создание объекта
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 50;
    sphere.position.z = 50;
    //sphere.rotation.y = a;
    //размещение объекта в сцене
    scene.add( sphere );
    } 
    function add3DCursor()
    {
        //параметры цилиндра: диаметр вершины, диаметр основания, высота, число сегментов
        var geometry = new THREE.CylinderGeometry( 1.5, 0, 5, 64 );
        var cyMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
         cursor3D = new THREE.Mesh( geometry, cyMaterial );
         cursor3D.visible = false;
         
        scene.add(cursor3D ); 
    }
    function onDocumentMouseScroll( event ) 
    {
        if (brVis==true)
            {   
            if (radius>1)
                if(event.wheelDelta<0)
                radius--;
            if (radius<40)
                if (event.wheelDelta>0)
                radius++;

            circle.scale.set(radius,1,radius);
            }
    }
    function onDocumentMouseMove( event )
    {
        var mpos = {};

        mpos.x = event.clientX - (window.innerWidth / 2);
        mpos.y = (window.innerHeight / 2) - event.clientY;
        if (sprtBtn[0] != null)
        {
            hitButton(mpos, sprtBtn[0]);
        }

        if (sprtBtn[1] != null)
        {
            hitButton(mpos, sprtBtn[1]);
        }
        //определение позиции мыши
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        
        //создание луча, исходящего из позиции камеры и проходящего сквозь позицию курсора мыши
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        vector.unproject(camera);
        var ray = new THREE.Raycaster( camera.position,vector.sub( camera.position ).normalize() );

            // создание массива для хранения объектов, с которыми пересечётся луч
            var intersects = ray.intersectObjects( targetList );

        if (brVis==true)
        {
            if ( intersects.length > 0 )
            {
                //печать списка полей объекта
            // 
                if(cursor3D!=null)
                {
                cursor3D.position.copy(intersects[0].point);
                cursor3D.position.y+=2.5;
                }
                if(circle!=null)
                {
                    circle.position.copy(intersects[0].point);
                // circle.rotation.x = Math.PI/2;
                    circle.position.y=0;
                    for (var i = 0; i < circle.geometry.vertices.length; i++)
                    {
                        //получение позиции в локальной системе координат
                        var pos = new THREE.Vector3();
                        pos.copy(circle.geometry.vertices[i]);
                        //нахождение позиции в глобальной системе координат
                        pos.applyMatrix4(circle.matrixWorld);

                        var x = Math.round(pos.x);
                        var z = Math.round(pos.z);

                        if(x >= 0 && x < N && z >= 0 && z < N )
                        {
                        var y = mas.vertices[z+x*N].y;
                        circle.geometry.vertices[i].y = y+0.03;
                        } else circle.geometry.vertices[i].y = 0;
                    }
                    circle.geometry.verticesNeedUpdate = true;
                }
               
            }
        }  
        else
        {
            
            if ( intersects.length > 0 )
            {
               
                if(selected != null && lmb == true)
                {
                    rayI=true;
                                            
                    selected.position.copy(intersects[0].point);

                    selected.userData.box.setFromObject(selected);

                    var pos = new THREE.Vector3();   
           
                    selected.userData.box.getCenter(pos);
                    
                    selected.userData.obb.position.copy(pos); 
                  
                    selected.userData.cube.position.copy(pos);
                    
                    for (i=0;i < objectList.length;i++)
                    {
                        if(selected.userData.cube != objectList[i])
                        {
                            objectList[i].material.visible = false;
                            objectList[i].material.color = {r:1, g:1, b:0}

                            if(intersect(selected.userData,objectList[i].userData.model.userData)==true)
                            {     
                                
                                rayI = false;
           
                                selected.position.copy(lastPos);

                                selected.userData.box.setFromObject(selected); 
                                
                                var pos1 = new THREE.Vector3();  

                                selected.userData.box.getCenter(pos1);

                                selected.userData.obb.position.copy(pos1); 
                              
                                selected.userData.cube.position.copy(pos1);

                                objectList[i].material.color = {r:1, g:0, b:0}
                                objectList[i].material.visible = true;
                                
                                
                            }

                        }
                    }
                    if ( rayI == true)
                    {
                        lastPos = intersects[0].point;
                    }
                    
                }
            }
        }      
    }
    function onDocumentMouseDown( event ) 
    {
        if (brVis==true)
        {
            if(selected!=null)
            selected.userData.cube.material.visible = false;
            //console.log(event.which);
            if (event.which == 1)
                brushDirection = 1;
            if (event.which == 3)
                brushDirection=-1;
        }else
        {
            lmb=true;
           // console.log("t");
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
            
            //создание луча, исходящего из позиции камеры и проходящего сквозь позицию курсора мыши
            var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
            vector.unproject(camera);
            var ray = new THREE.Raycaster( camera.position,vector.sub( camera.position ).normalize() );
            var intersects = ray.intersectObjects( objectList ,true);
            if (intersects.length>0)
            {
                if(selected!=null)
                {
                    selected.userData.cube.material.visible = false;

                    selected = intersects[0].object.userData.model;
  
                    selected.userData.cube.material.visible = true;
                
                }else
                {
                    selected = intersects[0].object.userData.model;
                    selected.userData.cube.material.visible = true;
                  
                }            
            }else
            if(selected!=null)
                {
                    selected.userData.cube.material.visible = false;
                    selected=null;
                }
        }
   }
    function onDocumentMouseUp( event ) 
    {
        if(brVis == true)
        {
            brushDirection=0;
        }else
        {    
           // console.log("f");        
            lmb = false;  
            var mpos = {};

            mpos.x = event.clientX - (window.innerWidth / 2);
            mpos.y = (window.innerHeight / 2) - event.clientY;
    
            if (sprtBtn[0] != null)
            {
                hitButton(mpos, sprtBtn[0]);
                clickButton(mpos, sprtBtn[0]);
            }
    
            if (sprtBtn[1] != null)
            {
                hitButton(mpos, sprtBtn[1]);
                clickButton(mpos, sprtBtn[1]);
            }

        }
    }
    function sphereBrush(dir,delta)
    {
        for(var i = 0; i < mas.vertices.length;i++)
        {
            var x2 = mas.vertices[i].x;
            var z2 = mas.vertices[i].z;
            var r = radius;
            var x1 = cursor3D.position.x;
            var z1 = cursor3D.position.z;

            //ℎ = √𝑟2 − ((𝑥2 − 𝑥1)2 + (𝑧2 − 𝑧1)2)

            var h = r*r - (((x2-x1)*(x2-x1)+((z2-z1)*(z2-z1))));
            if (h>0)
            {
                mas.vertices[i].y+=Math.sqrt(h)*delta*dir;
            }

        
        }
        mas.computeFaceNormals();
        mas.computeVertexNormals(); //пересчёт нормалей
        mas.verticesNeedUpdate = true; //обновление вершин
        mas.normalsNeedUpdate = true; //обновление нормалей

    }
function GUI()
    {

        //массив переменных, ассоциированных с интерфейсом
    var params =
    {
        sx: 0, sy: 0, sz: 0,direct: 0,
        brush: false,
        rain: false,
        addHouse: function() { addMesh('house') },
        addGrade: function() { addMesh('grade') }
      //  del: function() { delMesh() }
    };
  
    //создание вкладки
    var folder1 = gui.addFolder('Rotate');
    var folder2 = gui.addFolder('Direct');
    //ассоциирование переменных отвечающих за масштабирование
    //в окне интерфейса они будут представлены в виде слайдера
    //минимальное значение - 1, максимальное – 100, шаг – 1
    //listen означает, что изменение переменных будет отслеживаться
   // var meshSX = folder1.add( params, 'sx' ).min(1).max(100).step(1).listen();

    var meshSY = folder1.add( params, 'sy' ).min(1).max(630).step(1).listen();
    var direct = folder2.add( params, 'direct' ).min(-1000).max(1000).step(1).listen();
    
  // var meshSZ = folder1.add( params, 'sz' ).min(1).max(100).step(1).listen();
    //при запуске программы папка будет открыта
    folder1.open();
    folder2.open();
    //описание действий совершаемых при изменении ассоциированных значений
    
    direct.onChange(function(value) 
    {
        if(partVis == true)
        {
            var w1 = new THREE.Vector3(value/10,0,0);
            wind.copy(w1);
        }
    });
   meshSY.onChange(function(value) 
    {
        if (selected != null && brVis==false)
        {
            selected.userData.box.setFromObject(selected);
            var pos = new THREE.Vector3();
            selected.userData.box.getCenter(pos);
           // selected.userData.obb.position.copy(pos); 
            selected.userData.cube.position.copy(pos);
            selected.userData.cube.rotation.set(0, value * 0.01, 0);
            selected.rotation.set(0, value * 0.01, 0);
        }
    });
    

   // meshSZ.onChange(function(value) {…});
    //добавление чек бокса с именем brush
    var cubeVisible = gui.add( params, 'brush' ).name('brush').listen();
    cubeVisible.onChange(function(value)
    {
        brVis = value;
        cursor3D.visible = value;
        circle.visible = value;
    });
    //добавление кнопок, при нажатии которых будут вызываться функции addMesh
    //и delMesh соответственно. Функции описываются самостоятельно.
    if (brVis==false)
    {    
        gui.add( params, 'addHouse' ).name( "add house" );
        gui.add( params, 'addGrade' ).name( "add grade" );
        // gui.add( params, 'del' ).name( "delete" );
    }
    var particlesVisible = gui.add( params, 'rain' ).name('rain').listen();
    particlesVisible.onChange(function(value)
    {
        partVis = value;
    });
    //при запуске программы интерфейс будет раскрыт
    gui.open();
 }

function loadModel(path, oname, mname,s,name)
{
    // функция, выполняемая в процессе загрузки модели (выводит процент загрузки)
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };
        // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var onError = function ( xhr ) { };
        // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( path );
        // функция загрузки материала
    mtlLoader.load( mname, function( materials )
        {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( path );
       

            // функция загрузки модели
            objLoader.load( oname, function ( object )
            {
               

                object.castShadow = true;
                object.traverse( function ( child )
                    {
                        if ( child instanceof THREE.Mesh )
                            {
                                 child.castShadow = true;
                                 child.parent = object;
                            }
                    } );
                    object.parent = object;
                    var x = Math.random()*N;
                    var z = Math.random()*N;
                    var y = mas.vertices[Math.round(z)+Math.round(x)*N].y;
                    object.position.x = x;
                    object.position.y = y;
                    object.position.z = z;
                    //object.scale.set(2, 2, 2);
                    //var s =((Math.random()*100)+30)/400;
                    object.scale.set(s,s,s);
                    //scene.add(object.clone());
                    models.set(name, object);
                   // models.push(object);
                
            }, onProgress, onError );
        });
    
        
}
function addMesh(name)
{
   if (brVis == false)
   {
        var model = models.get(name).clone();
            
        var box = new THREE.Box3();
        box.setFromObject(model);

        model.userData.box= box;

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00,wireframe:  true} );
        var cube = new THREE.Mesh( geometry, material );
        
        scene.add( cube );
        cube.material.visible = false;
            //отмена скрытия объекта
            

        //получение позиции центра объекта
            var pos = new THREE.Vector3();
            box.getCenter(pos);
            //получение размеров объекта
            var size = new THREE.Vector3();
            box.getSize(size);
            
            //установка позиции и размера объекта в куб
            cube.position.copy(pos);
            cube.scale.set(size.x, size.y, size.z);

        model.userData.cube = cube;
        cube.userData.model = model;

        var obb = {};
        //структура состоит из матрицы поворота, позиции и половины размера
        obb.basis = new THREE.Matrix4();
        obb.halfSize = new THREE.Vector3();
        obb.position = new THREE.Vector3();
        //получение позиции центра объекта
            box.getCenter(obb.position);
        //получение размеров объекта
            box.getSize(obb.halfSize).multiplyScalar(0.5);
        //получение матрицы поворота объекта
        obb.basis.extractRotation(model.matrixWorld);
        //структура хранится в поле userData объекта

        model.userData.obb = obb;
       // model.position.y = mas.vertices[Math.round(model.position.z) + Math.round(model.position.x)*N].y + 0.3;
        
        objectList.push(cube);
        objectList1.push(model);
        scene.add(model);
    }
}
function intersect(ob1, ob2)
    {
        var xAxisA = new THREE.Vector3();
        var yAxisA = new THREE.Vector3();
        var zAxisA = new THREE.Vector3();
        var xAxisB = new THREE.Vector3();
        var yAxisB = new THREE.Vector3();
        var zAxisB = new THREE.Vector3();
        var translation = new THREE.Vector3();
        var vector = new THREE.Vector3();

        var axisA = [];
        var axisB = [];
        var rotationMatrix = [ [], [], [] ];
        var rotationMatrixAbs = [ [], [], [] ];
        var _EPSILON = 1e-3;

        var halfSizeA, halfSizeB;
        var t, i;

        ob1.obb.basis.extractBasis( xAxisA, yAxisA, zAxisA );
        ob2.obb.basis.extractBasis( xAxisB, yAxisB, zAxisB );

        // push basis vectors into arrays, so you can access them via indices
        axisA.push( xAxisA, yAxisA, zAxisA );
        axisB.push( xAxisB, yAxisB, zAxisB );
        // get displacement vector
        vector.subVectors( ob2.obb.position, ob1.obb.position );
        // express the translation vector in the coordinate frame of the current
        // OBB (this)
        for ( i = 0; i < 3; i++ )
        {
            translation.setComponent( i, vector.dot( axisA[ i ] ) );
        }
        // generate a rotation matrix that transforms from world space to the
        // OBB's coordinate space
        for ( i = 0; i < 3; i++ )
        {
            for ( var j = 0; j < 3; j++ )
                {
                    rotationMatrix[ i ][ j ] = axisA[ i ].dot( axisB[ j ] );
                    rotationMatrixAbs[ i ][ j ] = Math.abs( rotationMatrix[ i ][ j ] ) + _EPSILON;
                }
        }
        // test the three major axes of this OBB
        for ( i = 0; i < 3; i++ )
        {
            vector.set( rotationMatrixAbs[ i ][ 0 ], rotationMatrixAbs[ i ][ 1 ], rotationMatrixAbs[ i ][ 2 ]
            );
            halfSizeA = ob1.obb.halfSize.getComponent( i );
            halfSizeB = ob2.obb.halfSize.dot( vector );
            

            if ( Math.abs( translation.getComponent( i ) ) > halfSizeA + halfSizeB )
            {
                return false;
            }
        }
        // test the three major axes of other OBB
        for ( i = 0; i < 3; i++ )
        {
            vector.set( rotationMatrixAbs[ 0 ][ i ], rotationMatrixAbs[ 1 ][ i ], rotationMatrixAbs[ 2 ][ i ] );
            halfSizeA = ob1.obb.halfSize.dot( vector );
            halfSizeB = ob2.obb.halfSize.getComponent( i );
            vector.set( rotationMatrix[ 0 ][ i ], rotationMatrix[ 1 ][ i ], rotationMatrix[ 2 ][ i ] );
            t = translation.dot( vector );
            
            if ( Math.abs( t ) > halfSizeA + halfSizeB )
            {
                return false;
            }
        }
        // test the 9 different cross-axes
        // A.x <cross> B.x
        halfSizeA = ob1.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 0 ] + ob1.obb.halfSize.z *
        rotationMatrixAbs[ 1 ][ 0 ];
        halfSizeB = ob2.obb.halfSize.y * rotationMatrixAbs[ 0 ][ 2 ] + ob2.obb.halfSize.z *
        rotationMatrixAbs[ 0 ][ 1 ];
        t = translation.z * rotationMatrix[ 1 ][ 0 ] - translation.y * rotationMatrix[ 2 ][ 0 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // A.x < cross> B.y
        halfSizeA = ob1.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 1 ] + ob1.obb.halfSize.z *
        rotationMatrixAbs[ 1 ][ 1 ];
        halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 0 ][ 2 ] + ob2.obb.halfSize.z *
        rotationMatrixAbs[ 0 ][ 0 ];
        t = translation.z * rotationMatrix[ 1 ][ 1 ] - translation.y * rotationMatrix[ 2 ][ 1 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }

        // A.x <cross> B.z
        halfSizeA = ob1.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 2 ] + ob1.obb.halfSize.z *
        rotationMatrixAbs[ 1 ][ 2 ];
        halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 0 ][ 1 ] + ob2.obb.halfSize.y *
        rotationMatrixAbs[ 0 ][ 0 ];
        t = translation.z * rotationMatrix[ 1 ][ 2 ] - translation.y * rotationMatrix[ 2 ][ 2 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // A.y <cross> B.x
        halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 0 ] + ob1.obb.halfSize.z *
        rotationMatrixAbs[ 0 ][ 0 ];
        halfSizeB = ob2.obb.halfSize.y * rotationMatrixAbs[ 1 ][ 2 ] + ob2.obb.halfSize.z *
        rotationMatrixAbs[ 1 ][ 1 ];
        t = translation.x * rotationMatrix[ 2 ][ 0 ] - translation.z * rotationMatrix[ 0 ][ 0 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // A.y <cross> B.y
        halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 1 ] + ob1.obb.halfSize.z *
        rotationMatrixAbs[ 0 ][ 1 ];
        halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 2 ] + ob2.obb.halfSize.z *
        rotationMatrixAbs[ 1 ][ 0 ];
        t = translation.x * rotationMatrix[ 2 ][ 1 ] - translation.z * rotationMatrix[ 0 ][ 1 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // A.y <cross> B.z
        halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 2 ] + ob1.obb.halfSize.z *
        rotationMatrixAbs[ 0 ][ 2 ];
        halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 1 ] + ob2.obb.halfSize.y *
        rotationMatrixAbs[ 1 ][ 0 ];
        t = translation.x * rotationMatrix[ 2 ][ 2 ] - translation.z * rotationMatrix[ 0 ][ 2 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }

        // A.z <cross> B.x
        halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 0 ] + ob1.obb.halfSize.y *
        rotationMatrixAbs[ 0 ][ 0 ];
        halfSizeB = ob2.obb.halfSize.y * rotationMatrixAbs[ 2 ][ 2 ] + ob2.obb.halfSize.z *
        rotationMatrixAbs[ 2 ][ 1 ];
        t = translation.y * rotationMatrix[ 0 ][ 0 ] - translation.x * rotationMatrix[ 1 ][ 0 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // A.z <cross> B.y
        halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 1 ] + ob1.obb.halfSize.y *
        rotationMatrixAbs[ 0 ][ 1 ];
        halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 2 ] + ob2.obb.halfSize.z *
        rotationMatrixAbs[ 2 ][ 0 ];
        t = translation.y * rotationMatrix[ 0 ][ 1 ] - translation.x * rotationMatrix[ 1 ][ 1 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // A.z <cross> B.z
        halfSizeA = ob1.obb.halfSize.x * rotationMatrixAbs[ 1 ][ 2 ] + ob1.obb.halfSize.y *
        rotationMatrixAbs[ 0 ][ 2 ];
        halfSizeB = ob2.obb.halfSize.x * rotationMatrixAbs[ 2 ][ 1 ] + ob2.obb.halfSize.y *
        rotationMatrixAbs[ 2 ][ 0 ];
        t = translation.y * rotationMatrix[ 0 ][ 2 ] - translation.x * rotationMatrix[ 1 ][ 2 ];
        
        if ( Math.abs( t ) > halfSizeA + halfSizeB )
        {
            return false;
        }
        // no separating axis exists, so the two OBB don't intersect
        return true;
}
function addSprite(name1, name2, Click)
{
    var type;

    if (name1 == 'pics/house.jpg')
        type = 'house';

    if (name1 == 'pics/Врата.jpg')
        type = 'grade'
    //загрузка текстуры спрайта
    var texture1 = loader.load(name1);
    var material1 = new THREE.SpriteMaterial( { map: texture1 } );

    var texture2 = loader.load(name2);
    var material2 = new THREE.SpriteMaterial( { map: texture2 } );


    //создание спрайта
    sprite = new THREE.Sprite( material1);

    //центр и размер спрайта
    sprite.center.set( 0.0, 1.0 );
    sprite.scale.set( 128, 100, 1 );

    //позиция спрайта (центр экрана)
    sprite.position.set( 0, 0, 1 );
    sceneOrtho.add(sprite);    
    updateHUDSprite(sprite);

    var SSprite = {};
    SSprite.sprite = sprite;
    SSprite.mat1 = material1;
    SSprite.mat2 = material2;
    SSprite.click = Click;
    SSprite.type = type;

    if (type == "grade")
        sprite.position.set(-window.innerWidth / 2, window.innerHeight / 2.85, 1);

    if (type == "house")
        sprite.position.set(-window.innerWidth / 2, window.innerHeight / 2, 1);
    return SSprite;
}
function updateHUDSprite(sprite)
{
    var width = window.innerWidth / 2;
    var height = window.innerHeight / 2;

    sprite.position.set( -width, height, 1 );
}
function addButtons( name )
{
    if (name == 'house')
        sprt = addSprite('pics/house.jpg', 'pics/house1.jpg', houseClick); 
    
    if (name == 'grade')
        sprt = addSprite('pics/Врата.jpg', 'pics/Врата1.jpg', gradeClick); 
    return sprt;
}
function hitButton(mPos, sprite)
{
    var pw = sprite.sprite.position.x;
    var ph = sprite.sprite.position.y;
    var sw = pw + sprite.sprite.scale.x;
    var sh = ph - sprite.sprite.scale.y;

    if (mPos.x > pw && mPos.x < sw){
        if (mPos.y < ph && mPos.y > sh)
        {
            sprite.sprite.material = sprite.mat2;
        }
        else
            sprite.sprite.material = sprite.mat1;
    }
    else
        sprite.sprite.material = sprite.mat1;
}
function clickButton(mPos, sprite)
{
    var pw = sprite.sprite.position.x;
    var ph = sprite.sprite.position.y;
    var sw = pw + sprite.sprite.scale.x;
    var sh = ph - sprite.sprite.scale.y;

    if (mPos.x > pw && mPos.x < sw){
        if (mPos.y < ph && mPos.y > sh)
        {
            sprite.click();
        }
    }
}
function houseClick()
{
    addMesh('house');
}
function gradeClick()
{
    addMesh('grade');
}
function createSpriteMat(name)
{
    var texture = loader.load(name);
    var material = new THREE.SpriteMaterial( {map: texture} );
    return material;
}
function addDrop(mat,pos)
{
    sprite = new THREE.Sprite( mat );
    sprite.center.set(0.5, 0.5);
    sprite.scale.set(0.5, 1.5, 0.5);

    sprite.position.copy( pos );

    scene.add( sprite );

    var SSprite = {};
    SSprite.sprite = sprite;
    SSprite.v = new THREE.Vector3(0, 0, 0);
    SSprite.m = (Math.random()*0.1) + 0.01;

    return SSprite;
}

function emitter(delta)
{
    //if (partVis == true)
    {
        if (particles.length < MAX_PARTICLES &&  partVis == true)
        {
            var x = Math.random()*N;
            var z = Math.random()*N;

            var pos = new THREE.Vector4(x, 70, z);
            var particle = addDrop(rainMat,pos);
            particles.push(particle);
        }
        for (var i = 0; i < particles.length; i++)
        {
            particles[i].v = particles[i].v.add(g); 
            particles[i].sprite.position = particles[i].sprite.position.add(particles[i].v.multiplyScalar(delta * 10));
        }
        for (var i = 0; i < particles.length; i++)
        {
            //if(particles.length != 0)
                   
               if (particles[i].sprite.position.y < -5 && partVis == true)
                {
                    particles[i].sprite.position.y = 150;
                    particles[i].sprite.position.x = Math.random()*N;
                    particles[i].sprite.position.z = Math.random()*N;
                }

                    var v = new THREE.Vector3(0, 0, 0);
                    var w = new THREE.Vector3(0, 0, 0);
                    
                    w.copy(wind);
                    w.multiplyScalar(delta);
                    
                    v.copy(particles[i].v);
                    v.add(w);
                    
                    particles[i].sprite.position.add(v);
                    if(particles[i].sprite.position.y < -5 && partVis == false)
                    {                
                        //console.log(particles[i].sprite.position.y);
                        scene.remove(particles[i].sprite);
                        particles.splice(i,1);
                    }
            
        }
    }    
}