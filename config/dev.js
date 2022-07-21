module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  mini: {},
  h5:{
    devServer:{
      host:"localhost",
      port:10086,
      proxy:[
        {
          context:["/api"],
          target:"http://jf.client.jujiang.me",
          pathRewrite:{'^/api':''},
          changeOrigin:true,
          secure:false
        }
      ]
    }
  },
}
