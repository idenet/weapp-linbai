//index.js
//获取应用实例
const app = getApp()
const request = require('../../api/request')
const post = require('../../api/post')
const periodical = require('../../config/periodical')
const util = require('../../utils/util')

Page({
	data: {
		id: 0,
		likeStatus: 0, // 喜欢的状态
		year: 0,
		month: 0,
		index: 0, // 第几期刊
		indexShow: '',
		type: 0, // 类型
		content: [], // 内容
		title: '', // 标题
		favNums: 0, // 点赞数
		image: '',
		url: '', // mp3
		playState: false, // 播放状态
		time: 0 // 音频播放位置
	},

	onLoad() {
		this._getPeriodical()
  },
  clickMusic() {
    if(!this.data.playState) {
      this._clickMusicrunning()
    }else {
      this._clickMusicPause()
    }
  },
	clickLikeOrDis() {
		if (this.data.likeStatus === 0) {
			this._clickLike()
		} else {
			this._clickDislike()
		}
	},
	clickPrev() {
		this._initPlay() // 切换的时候关闭
		request.getPrev(this.data.index).then(res => {
			if (res.statusCode === 200) {
				this.setData({
					...periodical.factory(res.data)
				})
			} else if (res.data.error_code === 3000) {
				wx.showToast({
					title: '没有上一期内容',
					icon: 'none',
					duration: 1500,
					mask: false
				})
			}
		})
	},
	clickNext() {
		this._initPlay()
		request.getNext(this.data.index).then(res => {
			if (res.statusCode === 200) {
				this.setData({
					...periodical.factory(res.data)
				})
			} else if (res.data.error_code === 3000) {
				wx.showToast({
					title: '没有下一期内容',
					icon: 'none',
					duration: 1500,
					mask: false
				})
			}
		})
	},
	_initPlay() {
		if (this.innerAudioContext) {
			this.innerAudioContext.destroy()
			this.setData({
				playState: false,
				time: 0
			})
		}
	},
	_getDeatils() {
		console.log(this.data.id, this.data.type)
		request.details(this.data.type, this.data.id).then(res => {
			if (res.statusCode === 200) {
				this.setData({
					...periodical.factory(res.data)
				})
			}
		})
	},
	_getPeriodical() {
		request.getPeriodical().then(res => {
			if (res.statusCode === 200) {
				this.setData({
					...periodical.factory(res.data)
				})
				console.log(res.data)
			}
		})
	},
	_clickLike() {
		post.postLike({ art_id: this.data.id, type: this.data.type }).then(res => {
			if (res.data.error_code === 0) {
				this._getDeatils()
			}
		})
	},
	_clickDislike() {
		post.postDislike({ art_id: this.data.id, type: this.data.type }).then(res => {
			if (res.data.error_code === 0) {
				this._getDeatils()
			}
		})
  },
  _clickMusicrunning() {
		this.innerAudioContext = wx.createInnerAudioContext()
		util.loading('加载音乐资源...')
		this.innerAudioContext.src = this.data.url
		this.innerAudioContext.loop = true
		this.innerAudioContext.startTime = this.data.time
		this.innerAudioContext.play()
		this.innerAudioContext.onPlay(() => {
			console.log('正在播放')
			this.setData({
				playState: true
			})
			wx.hideLoading()
		})
  },
  _clickMusicPause() {
		if (this.innerAudioContext.paused === true) {
			return
		}
		this.innerAudioContext.pause()
		this.innerAudioContext.onPause(() => {
			console.log('暂停播放')
			this.setData({
				playState: false,
				time: this.innerAudioContext.currentTime
			})
		})
	},
	onReady() {},

	onShow() {},

	onHide() {
		this._initPlay()
	},

	onUnload() {
		// 当卸载页面的时候停止
		this._initPlay()
	},

	onPullDownRefresh() {},

	onReachBottom() {},

	onShareAppMessage(res) {
		if (res.from === 'button') {
			// 来自页面内转发按钮， 必须是按钮
			console.log(res.target)
		}
		return {
			title: '转发',
			path: '/index'
		}
	}
})
