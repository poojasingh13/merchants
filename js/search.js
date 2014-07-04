$(function(){
	$('body').search();
	$(document).on('click','.sharebutton',function(e){
		e.preventDefault();
		k = "/";
		a= window.top.location.pathname.split('/');
		for(i=0;i<a.length-1;i++){		
			if(a[i]!==""){
			 k = k+a[i]+'/';
			}
		}		
		FB.ui({
			method: 'feed',
			name: $(this).parent().find('.nm').text(),
			picture: window.top.location.origin+k+'images/logo_small.png',
			link: window.location.href,
			caption: $(this).parent().find('.cat a').text(),
			description: 'Spend at listed merchants in any 4 out of 6 categories mentioned below, every month, and get a complimentary movie voucher for two worth Rs. 700, every month',
			message: ''
		});
	});
});