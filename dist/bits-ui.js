riot.tag2('bits', '<yield></yield>', '', '', function(opts) {
});

riot.tag2('checkbox', '<yield></yield> <span></span>', '', '', function(opts) {
});

riot.tag2('file', '<yield></yield>', '', '', function(opts) {
    var self = this;
    self.on('mount', function(){
        self.root.querySelector('button')
            .addEventListener('click',
            function(){
                self.root.querySelector('input[type="file"]').click();
            }
        )
    });
});

riot.tag2('icon', '<svg ref="svg" class="{opts.theme} {opts.name}"></svg>', '', '', function(opts) {
    var self = this;
    var meta = document.querySelector(
        'link[rel="icon-svg"][theme="' + self.opts.theme + '"]'
    );
    try {
        self.href = meta.getAttribute('href');
    } catch (err) {
        console.log('Bits icon can\'t find <link rel="icon-svg">')
    };
    self.on('mount', function(){
        var use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use');
        use.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            self.href + '#' + self.opts.name);
        self.refs['svg'].appendChild(use);
    })
});

riot.tag2('markdown', '', '', '', function(opts) {
    var self = this;

    self.on('mount', function(){
        fetch(self.root.getAttribute('src')).then(function(response){
            return response.text();
        }).then(function(markdown){
            self.root.innerHTML = marked(markdown);
            if (Prism) {
                Prism.highlightAllUnder(self.root);
            };
        });
    })

});

riot.tag2('input-number', '<input max="5" min="0" step="1" value="0" type="number"> <button-group> <button-square onclick="{up}">+</button-square> <button-square onclick="{down}">-</button-square> </button-group>', '', '', function(opts) {
    var self = this;
    self.option = {
        "step": 1,
        "max": null,
        "min": null
    }

    self.on('mount', function(opts){
        self.input = self.root.querySelector('input');
        self.option.step = Number(self.input.getAttribute('step'));
        self.option.min = Number(self.input.getAttribute('min'));
        self.option.max = Number(self.input.getAttribute('max'));
    });

    this.up = function (event) {
        var value = Number(self.input.value) + self.option.step;
        if (self.option.max !== null && value > self.option.max) {
            return;
        }
        self.input.value = value;
    }.bind(this)

    this.down = function (event) {
        var value = Number(self.input.value) - self.option.step;
        if (self.option.min !== null && value < self.option.min) {
            return;
        }
        self.input.value = value;
    }.bind(this)
});

riot.tag2('menu-accordion', '<yield></yield>', '', '', function(opts) {
    var self = this;

    self.on('mount', function(){
        var caret = document.createElement('i');
        self.a_items = self.root.querySelectorAll('a');
        caret.classList.add('caret');
        for (item of self.a_items) {
            item.addEventListener('click', self.click);
            if (item.parentElement.querySelector('ul')) {
                item.appendChild(caret.cloneNode(true));
            };
        };
    })

    this._hide = function (li) {
        for (a of li.querySelectorAll('a')){
            a.classList.remove('on');
            ul = a.parentElement.querySelector('ul');
            if (!ul) { continue };
            ul.style.height = ul.scrollHeight;

            setTimeout(function(ul){
                ul.style.height = 0;
            }, 0, ul);
        }
    }.bind(this)

    this._show = function (li) {
        var a = li.querySelector('a');
        a.classList.add('on');
        ul = a.closest('ul');
        ul.style.height = 'auto';
        ul = li.querySelector('ul');
        if (!ul) { return };
        ul.style.height = ul.scrollHeight;
    }.bind(this)

    this.click = function (event) {
        var a = event.currentTarget;
        if (a.classList.contains('on')) {
            self._hide(a.parentElement);
        } else {
            self._show(a.parentElement);
        }
    }.bind(this)
});

riot.tag2('dot-pulse', '<div data-id="p1"></div> <div data-id="p2"></div> <div data-id="p3"></div>', '', '', function(opts) {
});

riot.tag2('radio', '<yield></yield> <span></span>', '', '', function(opts) {
});

riot.tag2('sidebar', '<yield></yield>', '', '', function(opts) {
    var self = this;

    self.on('mount', function(){
        self.opts.show = (typeof self.opts.show !== 'undefined') ? self.opts.show : '1000px';
        media_query = '(min-width: ' + self.opts.show + ')';
        self.media_query = window.matchMedia(media_query);
        if (self.media_query.matches) {
            setTimeout(function(){
                self.show_sidebar();
            }, 0)
        };
        self.media_query.addListener(self.media_change);
    })

    this.media_change = function () {
        if (self.media_query.matches) {
            self.show_sidebar();
        } else {
            self.hide_sidebar();
        }
    }.bind(this)

    this.show_sidebar = function () {
        self.refs.wrapper.classList.add('show');
        self.refs.overlay.classList.add('show');
    }.bind(this);
    this.hide_sidebar = function () {
        self.refs.wrapper.classList.remove('show');
        self.refs.overlay.classList.remove('show');
    }.bind(this);
});

riot.tag2('slide', '<div ref="slide"> <yield></yield> </div> <div ref="nav"></div>', '', '', function(opts) {
    var self = this;

    self.on('mount', function(opts) {
        self.refs.slide.addEventListener('touchstart', self.clear_interval, false);
        self.refs.slide.addEventListener('click', self.clear_interval, false);
        self.refs.slide.ondragstart = self.clear_interval;
        self.slides = self.refs.slide.querySelectorAll('.slide')
        var siema = {
            "selector": self.refs.slide,
            "loop": true,
            "onChange": self.on_change,
            "duration": 300
        };
        for (var key in opts) siema[key] = opts[key];
        self.siema = new Siema(siema);
        for (i=0; i<self.slides.length; i++) {
            var dot = document.createElement('dot');
            dot.dataset.i = i;
            self.refs.nav.appendChild(dot);
            dot.onclick = function(event){
                self.nav_click(event);
            };
        };
        self.dots = self.refs.nav.querySelectorAll('dot');
        self.dots[0].classList.add('selected');
        self.set_interval();
    });

    this.nav_click = function (event) {
        var self = this;
        var dot = event.currentTarget;
        self.refs.nav.querySelector('.selected').classList.remove('selected');
        dot.classList.add('selected');
        self.siema.goTo(dot.dataset.i);
        self.clear_interval();
    }.bind(this);

    this.on_change = function (event) {
        var i = self.siema.currentSlide;
        self.refs.nav.querySelector('.selected').classList.remove('selected');
        self.dots[i].classList.add('selected');
        self.trigger('change');
    }.bind(this);

    this.set_interval = function () {
        self.interval = setInterval(function(){
            self.siema.next();
        }, 4000)
    }.bind(this)

    this.clear_interval = function () {
        clearInterval(self.interval);
    }.bind(this);
});

riot.tag2('switch', '<yield></yield> <div ref="row"> <span ref="on">{opts.on}</span> <span ref="off">{opts.off}</span> </div> <div ref="paddle"></div>', '', '', function(opts) {
    var self = this;

    self.on('mount', function(opts){
        opts = (typeof opts !== 'undefined') ?  opts : {};
        opts.on = (typeof opts.on !== 'undefined') ?  opts.on : "ON";
        opts.off = (typeof opts.off !== 'undefined') ?  opts.off : "OFF";
        self.opts = opts;
        self.update();
    });
});

riot.tag2('toggle-btn', '<yield></yield>', '', '', function(opts) {
    var self = this;
    if (!self.opts['bg-color']) self.opts['bg-color'] = 'bg-p';
    if (!self.opts['toggle-color']) self.opts['toggle-color'] = 'bg-c';
    self.on('mount', function(){
        self.checkbox = self.root.querySelector('input');
        self.button = self.root.querySelector('button');
        self.button.classList.add(self.opts['bg-color']);
        self.checkbox.onclick = self.on_click;
    });

    this.on_click = function(event) {
        if (self.checkbox.checked === true) {
            self.button.classList.add(self.opts['toggle-color']);
        } else {
            self.button.classList.remove(self.opts['toggle-color']);
        }
    }.bind(this)
});

riot.tag2('toggle-pin', '<yield></yield>', '', '', function(opts) {
    var self = this;
    if (!self.opts['bg-color']) self.opts['bg-color'] = 'bg-p';
    if (!self.opts['toggle-color']) self.opts['toggle-color'] = 'bg-c';

    self.on('mount', function(){
        self.checkbox = self.root.querySelector('input');
        self.button = self.root.querySelector('button-pin');
        self.button.classList.add(self.opts['bg-color']);
        self.checkbox.onclick = self.on_click;
    });

    this.on_click = function(event) {
        if (self.checkbox.checked === true) {
            self.button.classList.add(self.opts['toggle-color']);
        } else {
            self.button.classList.remove(self.opts['toggle-color']);
        }
    }.bind(this)
});
