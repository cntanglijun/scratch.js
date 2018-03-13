(function (Scratch) {
  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
      define(function() {
          return Scratch;
      });
  } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = Scratch;
  } else {
      window.Scratch = Scratch();
  }
}(function () {

  // Scratch 类
  function Scratch(option) {
    'use strict';

    // 实例对象
    var _this = this;

    // 事件对象
    var events = !('ontouchend' in document) ? {
      mousedown: _handleStart,
      mousemove: _handleMove,
      mouseup: _handleEnd
    } : {
      touchstart: _handleStart,
      touchmove: _handleMove,
      touchend: _handleEnd
    }

    // 默认配置
    var _option = {
      scratchTarget: document.body,
      scratchRatio: .5,
      scratchWidth: 20,
      scratchImg: '',
      scratchColor: '#ccc',
      onScratchRatio: function () {}
    };

    _assign(_option, option);

    // 创建 canvas
    var canvas = document.createElement('canvas');
    // 获取 canvas 画布
    var ctx = canvas.getContext('2d');
    // 刮卡开关
    var start = false;
    // 缓存坐标
    var point = { x: 0, y: 0 };
    // 缓存图片
    var image = new Image();

    // 实例方法
    _this.reset = function () {
      ctx.globalCompositeOperation = 'source-over';

      if (_option.scratchImg) {
        _fillImg(image);
      } else {
        _fillColor();
      }
      _enable();
    }

    _this.clear = function () {
      _disable();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    _this.enable = _enable;
    _this.disable = _disable;

    _init();
    _fillCanvas();
    _enable();

    // 初始化
    function _init() {
      // 设置目标元素为父级元素
      _option.scratchTarget.style.position = 'relative';

      // 添加 canvas 到目标元素中
      _option.scratchTarget.appendChild(canvas);

      // 设置 canvas 宽高
      canvas.width = _option.scratchTarget.clientWidth;
      canvas.height = _option.scratchTarget.clientHeight;

      // 定位 canvas 覆盖目标区域
      canvas.style.position = 'absolute';
      canvas.style.top = 0;
      canvas.style.left = 0;

      // 设置画笔
      ctx.lineWidth = _option.scratchWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // 填充 canvas
    function _fillCanvas() {
      if (_option.scratchImg) {
        image = new Image();
        image.src = _option.scratchImg;
        image.addEventListener('load', function (e) {
          _fillImg(this);
        });
      } else {
        _fillColor();
      }
    }

    function _fillImg(image) {
      var sx = (image.width - canvas.width) / 2;
      var sy = (image.height - canvas.height) / 2;
      ctx.drawImage(image, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      _segGlobalCompositeOperation();
    }

    function _fillColor() {
      ctx.fillStyle = _option.scratchColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      _segGlobalCompositeOperation();
    }

    // 设置 globalCompositeOperation
    function _segGlobalCompositeOperation() {
      ctx.globalCompositeOperation = 'destination-out';
      // 显示目标元素
      _option.scratchTarget.style.opacity = 1;
    }

    // 事件处理
    function _handleStart(e) {
      e.preventDefault();
      start = true;
      point = _getPoint(e.touches ? e.touches[0] : e);
    }

    function _handleEnd(e) {
      e.preventDefault()
      start = false;
      _calcRatio();
    }

    function _handleMove(e) {
      e.preventDefault();
      var _point = _getPoint(e.touches ? e.touches[0] : e);

      if (start) {
        _fixAndroid43();

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(_point.x, _point.y);
        ctx.stroke();

        point = _point;
      }
    }

		// 强制重绘 修复 android 4.3- 不能刮奖的 bug
    function _fixAndroid43() {
      canvas.style.color = '#' + Math.floor(Math.random() * 10000).toString(16);
    }

    // 根据事件对象获取鼠标坐标
    function _getPoint(e) {
      return {
        x: e.pageX - _option.scratchTarget.offsetLeft,
        y: e.pageY - _option.scratchTarget.offsetTop
      }
    }

    // 计算刮奖比率
    function _calcRatio() {
      var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var allPixels = pixels.length / 4;
      var clearedPixels = 0;

      for (var i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) clearedPixels ++;
      }

      if (clearedPixels / allPixels >= _option.scratchRatio) {
        _option.onScratchRatio.call(_this);
      }
    }

    // 功能函数
    function _assign (target, varArgs) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };

    // 事件绑定
    function _enable() {
      for (var event in events) {
        canvas.addEventListener(event, events[event])
      }
    }

    // 取消事件绑定
    function _disable() {
      for (var event in events) {
        canvas.removeEventListener(event, events[event])
      }
    }
  }

  return Scratch
}))
