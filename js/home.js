$(document).ready(function() {
	$('body').search({
		page: 'home'
	});
	var cityName, $inputCity = $('input[name="city"]'), $inputCat = $('input[name="category"]'), $catA = $('a.cat','#category_nav'), $opaque = $('#opaque'),
	$cityDialog = $( '#citydialog' )

	$catA.click(function(e) {
		e.preventDefault();
		var $this = $(this);
		$catA.removeClass('active');
		$catA.children('span.active').removeClass('active');
		$this.addClass('active');
		$this.children('span').addClass('active');
		$inputCat.val($this.text());
		$('.search').slideDown('slow');
	});
	
	
	
	
});

function animatetext(){
		
		if($( ".find strong" ).hasClass('white')){
			$( ".find strong" ).animate({
				color:'#ff0033'
			});
			
		}else{
				$( ".find strong" ).animate({
				color:'#fff'
			});
			
		}
		$( ".find strong").toggleClass('white');
		setTimeout(function(){animatetext()},1000);
	}
animatetext();	
	