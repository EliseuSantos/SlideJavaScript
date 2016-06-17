var slideshow = $('.slideShow'),
    slides = slideshow.children('li');
var delta = 0,
    scrollThreshold = 6,
    resizing = false,
    scrolling = false;
var bindToggle = false;

function slideShow() {
  
  this.bindEventos(true);
  this.initSlideshow(slideshow);
  this.init(slideshow);
}
slideShow.prototype.init = function() {
  slides.on('click', function(event){
    var slide = $(event.currentTarget);
    if(!slide.hasClass('visivel') ) {
      this.atualizaSlide('nav', slide);
    } else if($(event.target).parents('.sub-visivel').length == 0 && $(event.target).parents('.sub-slides').length > 0 ) {
      var novoSubSlide = $(event.target).parents('.conteudo-slideShow').parent('li'),
          direcao = ( novoSubSlide.prev('.sub-visivel').length > 0 ) ? 'proxima' : 'anterior';
      this.atualizaSubSlide(slide, direcao);
    }
  }.bind(this));
  $(window).on('resize', function(){
   if( !resizing ) {
     (!window.requestAnimationFrame) ? this.atualizaOnResize() : window.requestAnimationFrame(function() {
        this.atualizaOnResize();
     }.bind(this));
     resizing = true;
   }
  }.bind(this));
};

slideShow.prototype.atualizaSubSlide = function(item, string, subSlide) {
  var translate = 0,
      margeSlide = Number(item.find('.conteudo-slideShow').eq(0).css('margin-right').replace('px', '')) * 6,
      larguraJanela = window.innerWidth;
      larguraJanela = larguraJanela - margeSlide;
  if( item.children('.sub-slides').length > 0 ) {
    var conteudoSubSlide = item.children('.sub-slides'),
      subSlideVisivel = conteudoSubSlide.children('.sub-visivel');
    if( subSlideVisivel.length == 0 ) subSlideVisivel = conteudoSubSlide.children('li').eq(0).addClass('sub-visivel');
    var novoSubSlide = (string == 'proxima') ? subSlideVisivel.next() : subSlideVisivel.prev();
    if(novoSubSlide.length > 0 ) {
      var posicaoNovoSubSlide = novoSubSlide.index();
      translate = parseInt(- posicaoNovoSubSlide*larguraJanela);
      this.setValorTransform(conteudoSubSlide.get(0), 'translateX', translate + 'px');
      subSlideVisivel.removeClass('sub-visivel');
      novoSubSlide.addClass('sub-visivel');
    }
  }
};

slideShow.prototype.atualizaSlide = function(string, slide) {
  var slideVisivel = slides.filter('.visivel'),
    margeSlide = ( slideVisivel.find('.conteudo-slideShow').length > 0 ) ? Number(slideVisivel.find('.conteudo-slideShow').eq(0).css('margin-bottom').replace('px', ''))*3 : 0,
    actualTranslate = this.getValorTranslate(slideshow.get(0), 'Y');
  var novoSlide = (string == 'proxima') ? slideVisivel.next() : slideVisivel.prev();

  if( novoSlide.length > 0 ) {
    $(window).off('DOMMouseScroll mousewheel', function() {
      this.atualizaOnScroll();
    }.bind(this));
    var translate = parseInt( - novoSlide.offset().top + actualTranslate + margeSlide);
    ( translate > 0) && ( translate = 0);
    this.setValorTransform(slideshow.get(0), 'translateY', translate + 'px');
    slideVisivel.removeClass('visivel');
    novoSlide.addClass('visivel');
    ( novoSlide.find('.sub-visivel').length == 0 ) && novoSlide.find('.sub-slides').children('li').eq('0').addClass('sub-visivel');
  }
}

slideShow.prototype.atualizaOnResize = function() {
  this.bindEventos(bindToggle);
  bindToggle = false;
  if ( slides.filter('.visivel').length == 0 ) slides.eq(0).addClass('visivel');
  this.atualizaSlide('nav', slides.filter('.visivel'));
  this.initSlideshow(slideshow);
  resizing = false;
}

slideShow.prototype.scroll = function(event) {
  if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) { 
    delta--;
    ( Math.abs(delta) >= scrollThreshold) && this.atualizaSlide('anterior');
  } else {
    delta++;
    (delta >= scrollThreshold) && this.atualizaSlide('proxima');
  }
  scrolling = false;
  return false;
}

slideShow.prototype.atualizaOnScroll = function(event) {
  if( !scrolling ) {
    (!window.requestAnimationFrame) ? scroll(event) : window.requestAnimationFrame(function(){scroll(event);});
    scrolling = true;
  }
}

slideShow.prototype.bindEventos = function() {
  $(window).on('DOMMouseScroll mousewheel', function() {
    this.atualizaOnScroll();
  }.bind(this));
  $(document).on('keydown', function(event){
    if( event.which=='40' ) {
      event.preventDefault();
      this.atualizaSlide('proxima');
    } else if( event.which=='38' ) {
      event.preventDefault();
      this.atualizaSlide('anterior');
    } else if( event.which=='39' ) {
      var slideVisivel = slides.filter('.visivel');
      this.atualizaSubSlide(slideVisivel, 'proxima');
    } else if ( event.which=='37' ) {
      var slideVisivel = slides.filter('.visivel');
      this.atualizaSubSlide(slideVisivel, 'anterior');
    }
  }.bind(this));
}

slideShow.prototype.initSlideshow = function(slideshow) {
  var larguraJanela = window.innerWidth;
  slideshow.children('li').each(function(){
    var slide = $(this),
      numeroSubSlide = slide.children('.sub-slides').children('li').length,
      larguraSlide = (numeroSubSlide) * larguraJanela;
    larguraSlide = ( larguraSlide == 0 ) ? larguraJanela : larguraSlide;
    slide.css('width', larguraSlide + 'px');
    if( numeroSubSlide > 0 ) { 
      var subSlideVisivel = slide.find('.sub-visivel');
      if( subSlideVisivel.length == 0 ) {
        subSlideVisivel = slide.find('li').eq(0);
        subSlideVisivel.addClass('sub-visivel');
      }
      this.atualizaSubSlide(slide ,'nav', subSlideVisivel);
    }
  }.bind(this));
}

slideShow.prototype.getValorTranslate = function(elemento, axis) {
  var elementoStyle = window.getComputedStyle(elemento, null),
    elementoTranslate = elementoStyle.getPropertyValue("transform");

  if( elementoTranslate.indexOf('(') >= 0) {
    elementoTranslate = elementoTranslate.split('(')[1];
  elementoTranslate = elementoTranslate.split(')')[0];
  elementoTranslate = elementoTranslate.split(',');
  var valorTranslate = ( axis == 'X') ? elementoTranslate[4] : elementoTranslate[5];
  } else {
    var valorTranslate = 0;
  }
  return Number(valorTranslate);
}

slideShow.prototype.setValorTransform = function(elemento, propriedade, valor) {
  elemento.style["transform"] = propriedade+"("+valor+")";

  $(elemento).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
    delta = 0;
    $(window).on('DOMMouseScroll mousewheel', function() {
      this.atualizaOnScroll();
    }.bind(this));
  });
}