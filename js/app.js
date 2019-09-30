
(function($) {
    var resBgImg,
        resBorderImg;

    var Page = function () {
        this.init()
    };

    // init
    Page.prototype.init = function () {
        this.isUpload = false; // 是否长传图片
        this.beforeRoate = null 
        // this.isChose = false; // 是否选择 头像类型
        this.resBorder = resBorderList[0];
        this.initDom();
        this.initEvent();
    };

    // DOM
    Page.prototype.initDom = function () {
        this.$index  = $('.index');
        this.$upload = $('.upload');
        this.$result = $('.result');
        this.$share  = $('.share');
    };

    // 选择的轮播
    Page.prototype.initSlide = function () {
        var that = this
        var swiper = new Swiper('.head-list .swiper-container', {
            loop: false,
            initialSlide: 1,
            centeredSlides: true,
            slidesPerView: 3,
            spaceBetween: 30,
            slideToClickedSlide: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                slideChangeTransitionEnd: function () {
                    var index = this.activeIndex;
                    that.$upload.find('.review').css('background-image', 'url(img/res-border' + index + '.png)');
                    that.resBorder = resBorderList[index];

                    var resBorder = new Image();
                    resBorder.onload = function () {
                        resBorderImg = resBorder;
                    };
                    resBorder.src = that.resBorder.data;
                }
            }
        });
    };

    // 预加载要写入结果集的图片
    Page.prototype.initImg = function () {
        var that = this;
        var resBgImg1 = new Image();
        resBgImg1.onload = function () {
            resBgImg = resBgImg1;
        };
        resBgImg1.src = resBg;

        var resBorder = new Image();
        resBorder.onload = function () {
            resBorderImg = resBorder;
        };
        resBorder.src = that.resBorder.data;
    };

    /* *
     * [drawImg description]
     * @param
     *  opt 图片位置参数
     *  postL: 距离画布左
     *  postT: 距离画布顶
     *  width: 图片宽
     *  height: 图片高
     */
    Page.prototype.drawImg = function (ctx, img, opts) {
        var postL = opts.postL || 0;
        var postT = opts.postT || 0;
        ctx.drawImage(img, postL, postT, opts.width, opts.height);  // 背景
    };

    // event
    Page.prototype.initEvent = function () {
        var that = this;
        // 开始，领取专属头像
        that.$index.find('#startBtn').on('click', function () {
            that.$upload.fadeIn(function () {
                that.$index.hide().remove();
            });
            that.initSlide();
            that.initImg();
        });

        var cutCanvas = document.getElementById('cutCanvas'); // 裁剪照片
        var resCanvas = document.getElementById('resCanvas'); // 生成结果
        var ctrlLayer = document.getElementById('ctrlLayer');

        // 头像上产
        that.$upload.find('#uploadFile').on('change', function (e) {
            var
                file = this.files[0],
                fileReader = new FileReader();
            if(typeof file === 'undefined') {
                return false;
            }
            if(file.type && !/image\/\w+/.test(file.type)) {
                alert('请上传图片文件');
                return false;
            }
            fileReader.readAsDataURL(file);
            fileReader.onload = function() {
                var result = this.result;
                var img = new Image();
                var exif;

                var base64 = result.replace(/^.*?,/, '');
                var binary = atob(base64);
                var binaryData = new BinaryFile(binary);
                exif = EXIF.readFromBinaryFile(binaryData);
                var orientation = exif ? exif.Orientation : 1;
                cutCanvas.style.display = 'block';
                ctrlLayer.style.display = 'block';
                that.$upload.find('.upload-info').hide();
                that.$upload.find('.review').show();
                that.$upload.find('.cut-tips').show();
                img.onload = function() {
                    var gesturableImg = new ImgTouchCanvas({
                        canvas: cutCanvas,
                        contrler: ctrlLayer,
                        path: img.src,
                        imgRoate: orientation,
                        beforeRoate:that.beforeRoate
                    });
                    that.beforeRoate = orientation
                };
                that.isUpload = true;
                img.src = result;
            };
        })

        // 开始生成
        that.$upload.find('.create-btn').on('click', function () {
            if (!that.isUpload) {
                alert('请先上传您的头像');
                return false;
            }
            // if (!that.isChose) {
            //     alert('请先选择头像类型');
            //     return false;
            // }
            var imgData = cutCanvas.toDataURL(0.99);

            var ctx = resCanvas.getContext('2d');
            ctx.fillStyle = "rgba(255,255,255,0)";
            ctx.fillRect(0, 0, resCanvas.width, resCanvas.height);

            var resImg;

            var headImg = new Image();
            headImg.onload = function() {

                // 层级按照写入顺序，越晚写入越靠上
                // 背景
                that.drawImg(ctx,resBgImg,{
                    postL: 0,
                    postT: 0,
                    width: 613,//614
                    height: 661//
                });
                // 头像
                that.drawImg(ctx,headImg,{
                    postL: 139,
                    postT: 138,
                    width: 336,//614
                    height: 389//665
                });
                // 边框
                that.drawImg(ctx,resBorderImg,{
                    postL: 48,
                    postT: 47,
                    width: 518,//614
                    height: 571//665
                });
                resImg = resCanvas.toDataURL(0.99);

                // 结果图
                that.$result.find('.res-img').attr('src', resImg)
            };
            headImg.src = imgData;
            that.$result.fadeIn(function () {
                that.$upload.hide();
            })
        })

        // 重新上传
        that.$upload.find('.reupload').on('click', function () {
            that.$upload.find('#uploadFile').trigger('click');
        });

        // 重新选择
        that.$result.find('.again-btn').on('click', function () {
            that.$upload.show();
            that.$result.fadeOut();
        })

        // 分享
        that.$result.find('.share-btn').on('click', function () {
            that.$share.fadeIn();
        })

        // 关闭分享
        that.$share.on('click', function () {
            that.$share.fadeOut();
        })
    };

    $(function() {
        // console.log(Pace);
        var hideCallback = function () {
            // Pace.stop();
            // $(".load").addClass('out');
            // setTimeout(function () {
            //     $(".load").remove();
            //     new Page();
            // }, 600);
            $('.loading').fadeOut();
            window.resize();
            $('body').addClass('show');
            $('.pace').hide();
            new Page();
            window.paceInterval && window.clearInterval(window.paceInterval);
        };
        window.paceInterval = setInterval(function () {
            var progress = $('.pace-progress').attr('data-progress');
            if (parseInt(progress) >= 98) {
                hideCallback();
            }
        }, 300);
        Pace.on('hide',function () {
            console.log(arguments);
            $('#index').addClass('on');
        })
    })

})(jQuery);
/*  |xGv00|ed5b996c5b2ae603e156bea92caa9731 */