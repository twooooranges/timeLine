module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/timeLine/' : '/',
    devServer: {
        https: true, // https:{type:Boolean
        port: 8089 // 此处修改你想要的端口号
    },
}
