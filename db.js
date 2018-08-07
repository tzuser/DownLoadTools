//import mongoose,{Schema} from 'mongoose';
let mongoose=require('mongoose');
let {Schema}=mongoose;
let db=mongoose.connect('mongodb://web:wysj3910@127.0.0.1:27017/web')
//用户
const userSchema=new Schema({
  name:{type:String,index:true},
  password:String,
  nick_name:{type:String,index:true},
  age:Number,
  creationDate:Date,
  sex:Number,
  avatar:String,
  //posts:[{ type: Schema.Types.ObjectId, ref: 'Post' }],
  roles:[String],
})

//帖子
const postSchema=new Schema({
  type:String,//类型
  user:{type:Schema.Types.ObjectId,ref:'User'},//作者
  content:String,//内容
  sourceId:String,//源id
  thumbnail:{
    url:String,
    width:Number,
    height:Number,
  },//缩略图
  photos:[{
    url:String,
    width:Number,
    height:Number,
    title:String
  }],//图片集合
  tags:[{type:String,index:true}],//标签
  src:String,//视频 音频 等地址
  creationDate:Date,//创建日期
  updateDate:Date,//修改日期
  readNum:Number,//阅读量
  likeNum:Number,//喜欢人数
  hotNum:Number,//热度
  commentNum:Number,//评论量
  rootUser:{type:Schema.Types.ObjectId,ref:'User'},//发帖人
  fromUser:{type:Schema.Types.ObjectId,ref:'User'},//被转帖人
  comments:[{type:Schema.Types.ObjectId,ref:'Comment'}]
})

//评论
const commentSchema=new Schema({
  reply:{type:Schema.Types.ObjectId,ref:'User'},//回复用户
  post:{type:Schema.Types.ObjectId,ref:'Post'},
  content:String,//内容
  creationDate:Date,//评论日期
  user:{type:Schema.Types.ObjectId,ref:'User'},//用户
})

//喜欢
const likeSchema=new Schema({
  user:{type:Schema.Types.ObjectId,ref:'User'},//用户
  post:{type:Schema.Types.ObjectId,ref:'Post'},//帖子
})
module.exports={
  userModel:mongoose.model('User',userSchema),
  postModel:mongoose.model('Post',postSchema),
  likeModel:mongoose.model('Like',likeSchema),
  commentModel:mongoose.model('Comment',commentSchema)
}