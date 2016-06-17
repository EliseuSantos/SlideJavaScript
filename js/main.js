$(document).ready(function(){
	var slideshow = $('.slideShow'),
	   	slides = slideshow.children('li');
	var delta = 0,
      scrollThreshold = 6,
  	 	resizing = false,
    	scrolling = false;

	var bindToggle = false;
	bindEventos(true);
	initSlideshow(slideshow);

	slides.on('click', function(event){
		var slide = $(this);
		if(!slide.hasClass('visivel') ) {
			atualizaSlide('nav', slide);
		} else if($(event.target).parents('.sub-visivel').length == 0 && $(event.target).parents('.sub-slides').length > 0 ) {
			var novoSubSlide = $(event.target).parents('.conteudo-slideShow').parent('li'),
			 	  direcao = ( novoSubSlide.prev('.sub-visivel').length > 0 ) ? 'proxima' : 'anterior';
			atualizaSubSlide(slide, direcao);
		}
	});

	$(window).on('resize', function(){
		if( !resizing ) {
			(!window.requestAnimationFrame) ? atualizaOnResize() : window.requestAnimationFrame(atualizaOnResize);
		 	resizing = true;
		}
	});
  
	function atualizaSubSlide(item, string, subSlide) {
		var translate = 0,
  			margeSlide = Number(item.find('.conteudo-slideShow').eq(0).css('margin-right').replace('px', '')) * 6,
	   		larguraJanela = window.innerWidth;
    		larguraJanela = larguraJanela - margeSlide;

		if( item.children('.sub-slides').length > 0 ) {
			var conteudoSubSlide = item.children('.sub-slides'),
				subSlideVisivel = conteudoSubSlide.children('.sub-visivel');
			if( subSlideVisivel.length == 0 ) subSlideVisivel = conteudoSubSlide.children('li').eq(0).addClass('sub-visivel');
			
			var	novoSubSlide = (string == 'proxima') ? subSlideVisivel.next() : subSlideVisivel.prev();

			if(novoSubSlide.length > 0 ) {
				var posicaoNovoSubSlide = novoSubSlide.index();
				translate = parseInt(- posicaoNovoSubSlide*larguraJanela);

				setValorTransform(conteudoSubSlide.get(0), 'translateX', translate + 'px');
				subSlideVisivel.removeClass('sub-visivel');
				novoSubSlide.addClass('sub-visivel');
			}
		}
	}

	function atualizaSlide(string, slide) {
  	var slideVisivel = slides.filter('.visivel'),
  		margeSlide = ( slideVisivel.find('.conteudo-slideShow').length > 0 ) ? Number(slideVisivel.find('.conteudo-slideShow').eq(0).css('margin-bottom').replace('px', ''))*3 : 0,
  		actualTranslate = getValorTranslate(slideshow.get(0), 'Y');
		var novoSlide = (string == 'proxima') ? slideVisivel.next() : slideVisivel.prev();

  	if( novoSlide.length > 0 ) {
  		$(window).off('DOMMouseScroll mousewheel', atualizaOnScroll);
  		var translate = parseInt( - novoSlide.offset().top + actualTranslate + margeSlide);
  		( translate > 0) && ( translate = 0);
  		setValorTransform(slideshow.get(0), 'translateY', translate + 'px');
  		slideVisivel.removeClass('visivel');
		  novoSlide.addClass('visivel');
		  ( novoSlide.find('.sub-visivel').length == 0 ) && novoSlide.find('.sub-slides').children('li').eq('0').addClass('sub-visivel');
    }
  }

	function atualizaOnResize() {
		bindEventos(bindToggle);
		bindToggle = false;
		if ( slides.filter('.visivel').length == 0 ) slides.eq(0).addClass('visivel');
		atualizaSlide('nav', slides.filter('.visivel'));
		initSlideshow(slideshow);
		resizing = false;
	}

	function scroll(event) {
    if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) { 
      delta--;
      ( Math.abs(delta) >= scrollThreshold) && atualizaSlide('anterior');
    } else {
      delta++;
      (delta >= scrollThreshold) && atualizaSlide('proxima');
    }
    scrolling = false;
    return false;
  }

	function atualizaOnScroll(event) {
  	if( !scrolling ) {
  		(!window.requestAnimationFrame) ? scroll(event) : window.requestAnimationFrame(function(){scroll(event);});
	 	  scrolling = true;
  	}
  }

	function bindEventos(bool) {
		$(window).on('DOMMouseScroll mousewheel', atualizaOnScroll);
  		$(document).on('keydown', function(event){
			if( event.which=='40' ) {
				event.preventDefault();
				atualizaSlide('proxima');
			} else if( event.which=='38' ) {
				event.preventDefault();
				atualizaSlide('anterior');
			} else if( event.which=='39' ) {
				var slideVisivel = slides.filter('.visivel');
				atualizaSubSlide(slideVisivel, 'proxima');
			} else if ( event.which=='37' ) {
				var slideVisivel = slides.filter('.visivel');
				atualizaSubSlide(slideVisivel, 'anterior');
			}
		});
  }

	function initSlideshow(slideshow) {
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
				atualizaSubSlide(slide ,'nav', subSlideVisivel);
			}
		});
	}

	function getValorTranslate(elemento, axis) {
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

	function setValorTransform(elemento, propriedade, value) {
		elemento.style["transform"] = propriedade+"("+value+")";

		$(elemento).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			delta = 0;
			$(window).on('DOMMouseScroll mousewheel', atualizaOnScroll);
		});
	}
});