//获取登录用户的信息
var getUserInfo = function() {
    //从sessionStorage中获取用户信息
    if(sessionStorage.getItem('userInfo')) {
        //将用户信息解析成JSON对象并赋值给userInfo
        var userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        
        return {
            token: userInfo.token, 
            user: userInfo.user
        };
    }
}


/**
 * 上传图片到服务器
 * @param {Object} options - 参数对象
 * @param {string} options.container - 图片容器的选择器
 * @param {string} options.dom - input[type="file"] 的选择器
 * @param {string} options.img - 图片的选择器
 * @param {Function} options.success - 图片上传成功后的回调函数
 * @param {Function} options.error - 图片上传失败后的回调函数
 */
var uploadImageToServer = function(options) {
    var container = options.container || '.img-box';
    var dom = options.dom || '.upload';
    var img = options.img || '.preview';
    var success = options.success || function() {};
    var error = options.error || function() {};

    $(container).on('change', dom, function(e){
        var $li = $(this).parent().parent();
        var index = $li.index();
        console.log($li);
        
        var file = e.target.files[0]; //获取文件资源
        var reader = new FileReader(); //创建FileReader实例
        
        reader.readAsDataURL(file); //将文件读取为Data URL
        
        //渲染文件
        reader.onload = function(e) { //当读取操作完成时触发
            var formData = new FormData(); //创建FormData实例

            formData.append('file', file); //将file添加到formData中
            
            $.ajax({
                type: "post", //POST请求
                url: getBaseUrl() + "/file/uploadImage", //请求地址
                headers: {
                    "X-Token": getUserInfo().token  //设置请求头部信息中的X-Token
                },
                processData: false, //不处理数据
                contentType: false, //不设置数据类型
                data: formData, //设置请求数据为formData
                success: function(res) {  //请求成功时的回调函数
                    if(res.code === 5000) { //如果请求返回的状态码为5000
                        error(res.message); //执行错误回调函数
                        return;
                    } 

                    var coverUrl = res.data.url; //获取返回的图片地址
                    success(coverUrl, $li, index); //执行成功回调函数
                },
                error: function(xhr, status, error) {
                    error(error); //执行错误回调函数
                }
            })
        }
    });
}


//监听下拉框，更改相对应option的selected属性
var listenSelectBox = function(dom) {
    $(dom).change(function() { //监听dom元素的change事件
        var $options = $(this).find('option'); //获取dom元素下的所有option元素
        var selectedIndex = $(this).find('option:selected').index(); //获取被选中的option元素在所有option元素中的索引值
        $options.removeAttr('selected'); //将所有option元素的selected属性值删除
        $options.eq(selectedIndex).attr('selected', 'selected'); //将被选中的option的元素的selected属性设置为selected
    });
}

//通过下拉框，获取相对应的value
var getValueFromSelect = function(dom) {
    var val = ''; //初始化val为空字符串
    $(dom).find('option').each((idx, elem) => { //遍历dom元素下的所有option元素
        if($(elem).attr('selected')) { //如果当前元素的selected属性存在
            val = elem.value; //将val设置为当前元素的value值
        } 
    })
    return val; //返回val
}

//获取服务器地址
var getBaseUrl = function() {
    return 'https://rocket.dev.yes-z.com'; 
}

//如果当前是登录状态，阻止返回登录页面
var stopBack = function() {
    var loginStatus = sessionStorage.getItem('loginStatus'); //获取登录状态信息

    console.log(loginStatus); 
    if(loginStatus) { //如果登录状态存在
        location.href = './admin.html'; //跳转到管理员页面
    }
}

//检查当前是否为登录状态
var isAuth = function() {
    var loginStatus = sessionStorage.getItem('loginStatus'); //获取登录状态信息
    return loginStatus; //返回登录状态信息
}
//如果当前不是登录状态，回到登录界面
var backToLoginPage = function() {
    if(!isAuth()) { //如果当前不是登录状态
        location.href = './login.html'; //跳转到登录界面
    } 
}

//移除登录状态信息
var removeLoginStatus = function() {
    sessionStorage.removeItem('loginStatus'); 
    console('删除成功');
}


//移除banner配置的客户端数据信息
var removeBannerData = function() {
    var removeList = ['rotation', 'activity', 'hot', 'pioneering']; //需要移除的数据列表
    removeList.forEach(function(elem, idx) { //遍历需要删除的数据列表
        if(sessionStorage.getItem(elem)) { //如果sessionStorage中存在该数据
            sessionStorage.removeItem(elem); //移除该数据
        }
    });
}

//移除首页文章配置的客户端数据信息
var removeIndexData = function() {
    var removeList = ['tiktok', 'facebook', 'google']; //需要移除的数据列表
    removeList.forEach(function(elem, idx) { //遍历需要删除的数据列表
        if(sessionStorage.getItem(elem)) {  //如果sessionStorage中存在该数据
            sessionStorage.removeItem(elem); //移除该数据
        }
    });
}




//服务器对象
var server = {
    /**
    * 发送ajax请求并返回promise对象
    * @param {object} opt 请求参数对象
    * @param {string} opt.type 请求类型，GET或POST
    * @param {string} opt.url 请求地址
    * @param {object} opt.headers 请求头部信息
    * @param {object} opt.data 请求数据
    * @return {Promise} Promise对象
    */
    ajaxReturn: function(opt) { 
        var promise = new Promise(function(resolve, reject){
            $.ajax({
                type: opt.type,
                url: getBaseUrl() + opt.url,
                headers: opt.headers,
                data: opt.data,
                success: function(res) { //请求成功的回调函数
                    resolve(res); //将请求成功返回的数据传递给resolve函数
                },
                error: function(err) { //请求失败的回调函数
                    reject(err); //将错误信息传递给reject函数
                }
            });
        });
        return promise; //返回Promise实例
    }
};


//退出登录
var logout = function() {
    var userInfo = getUserInfo(), //获取用户信息
        loginStatus = sessionStorage.getItem('loginStatus'); //获取登录状态信息
    
    $('.logout').click(function() { //监听.logout元素的点击事件
        var logoutPromise = server.ajaxReturn({ //创建Promise实例
            type: "POST", //请求类型
            url: "/user/logout", //请求地址
            data: {}, //请求数据
            headers: {
                "X-Token": userInfo.token  //请求头部信息
            }
        });

        logoutPromise.then(function(res){ //请求成功的回调函数
            //退出登录业务逻辑
            if(res.code === 1000) {
                 alert('退出登录成功');
                 location.href = 'login.html'; //跳转到登录页面
                 removeLoginStatus(); //移除登录状态信息
                 removeBannerData(); //移除banner配置的客户端数据信息
                 removeIndexData(); //移除首页文章配置的客户端数据信息
            }

            if(res.data.result) { //退出登录成功
                alert('退出登录成功');
                location.href = 'login.html'; //跳转到登录页面
                removeLoginStatus();  //移除登录状态信息
                removeBannerData(); //移除banner配置的客户端数据信息
                removeIndexData(); //移除首页文章配置的客户端数据信息
            } else { //退出登录失败
                alert('退出登录失败');
            }
        }).catch(function(err){ //请求失败时的回调函数
            //捕获错误
            console.log(err);
        });
    });
}




