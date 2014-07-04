(function($) {
	$.fn.extend({
		search: function (settings) {
			settings = $.extend({
				cityContainer: '.city-div',
				categoryContainer: '.category-div',
				filterCategory: '.filter-category',
				filterCity: '.filter-city',
				filterText: '.filter-text',
				filterButton: '.filter-button',
				filterFavourite:'.filter-favourite',
				filterData: '.filter-data',
				featuredPartners: '.featured-partners',
				cityXml: 'xml/city.xml',
				categoryXml: 'xml/category.xml',
				total: 10,
				defaultCity: 'Delhi',
				ignoreCity: 'Please Visit',
				page: 'search',
				cityDialog: '#citydialog',
				cityDialogForm: '#city_form',
				cityDialogBtn: '#city_btn',
				homeCity: 'input[name="city"]',
				homeCategory: 'input[name="category"]',
				homeSearchForm: '#search_form',
				opaque: '#opaque',
				cell: {
					0: 'nm heading',		//name
					1: 'add',		// addess
					2: 'e-m mobid'		// email-mobile
				}
			}, settings);
			return this.each(function () {
				new $.yoku(this, settings);
			});
		}
	});
	$.yoku = function(me, opt) {
		var y = {
			version: '1.0',
			author: 'YoKu',
			website: 'www.monthly-blockbusters.com',
			purpose: 'General Search',
			opt: $.extend({
				end: 0,
				start: 0,
				counter: 0,
				backupEnd: 0
			},opt),
			obj: {
				$me: $(me),
				$city: $(opt.cityContainer),
				$cityTopFilter: null,
				$cityTopDisplay: null,
				$category: $(opt.categoryContainer),
				$filterCategory: $(opt.filterCategory),
				$filterCity: $(opt.filterCity),
				$filterText: $(opt.filterText),
				$filterButton: $(opt.filterButton),
				$filterFavourite: $(opt.filterFavourite),
				$filterData: $(opt.filterData),
				$featuredPartners: $(opt.featuredPartners),
				$nextButton: null,
				$prevButton: null,
				$dataDiv: null,
				$cityDialog: $(opt.cityDialog),
				$cityDialogForm: $(opt.cityDialogForm),
				$cityDialogSelect: null,
				$cityDialogBtn: $(opt.cityDialogBtn),
				$homeCity: $(opt.homeCity),
				$homeCategory: $(opt.homeCategory),
				$homeSearchForm: $(opt.homeSearchForm),
				$opaque: $(opt.opaque),
				$catA: $()
			},
			dt: {
				xml: null,
				city: [],
				category: [],
				fp: {}
			},
			vr: {
				getCity: false,
				getData: false,
				selectedCategory: '',
				selectedCategoryIndex: 0,
				selectedCity: '',
				searchText: '',
				fav: ''
			},
			func: {
				init: function() {
					var cityName = $.cookie('ct');
					if ('home' == y.opt.page) {
						y.func.createCityTopFilter();
						if (void 0 != cityName && '' != cityName) {
							y.obj.$cityTopFilter.val(cityName).change();
						}
						else {
							y.obj.$cityDialog.dialog({
								modal:true,
								open:function(){
									y.func.createCityFilterDialog();
									y.obj.$opaque.show();
									y.obj.$cityDialogForm.show();
									$('button.ui-dialog-titlebar-close').remove();
								}
							});
							y.obj.$cityDialogBtn.click(function() {
								cityName = y.obj.$cityDialogSelect.val();
								if ( '' != cityName) {
									y.obj.$cityDialog.dialog('close');
									y.obj.$opaque.hide();
									y.obj.$cityTopFilter.val(cityName).change();
								}
							});
						}
						y.func.loadCategory();
						y.func.createCategoryNav();
						y.func.createFavouriteButton();
					}
					else {
						y.vr.selectedCity = y.func.getParam('city') || cityName;
						y.vr.selectedCategory = y.func.getParam('category');
						y.vr.searchText = y.func.getParam('search');
						y.vr.fav = y.func.getParam('fav');

						y.func.createCityTopFilter();
						// select default value of city
						if ('' == y.vr.selectedCity && y.dt.city.length > 0) {
							if (y.dt.city.indexOf(y.opt.defaultCity) > 0) {
								y.vr.selectedCity = y.opt.defaultCity.toLowerCase();
							}
							else {
									y.vr.selectedCity = y.dt.city[0].toLowerCase();
							}
						}
						//y.func.loadData();
						y.func.loadCategory();
						y.func.createCategoryNav();

						y.func.createCityFilter();
						y.func.createCategotyFilter();
						y.func.createTextFilter();
						y.func.createButtonFilter();
						y.func.createFavouriteButton();

						// search fill text
						if ('' != y.vr.searchText) {
							y.obj.$filterText.val(y.vr.searchText);
						}

						// select category
						if ('' != y.vr.selectedCategory) {
							y.obj.$filterCategory.val(y.vr.selectedCategory).change();
						}
						else {
							y.obj.$filterCategory.change();
						}

						// open favourite outlets
						if ('' != y.vr.fav) {
							y.func.showFav();
						}
					}
				},
				loadXml: function(xmlFile) {
					if (window.XMLHttpRequest)
					{
						xhttp=new XMLHttpRequest();
					}
					else
					{
						xhttp=new ActiveXObject('Microsoft.XMLHTTP');
					}
					xhttp.open('GET', xmlFile, false);
					xhttp.send();
					return xhttp.responseXML;
				},
				loadData: function (category) {
					if (void 0 == category.data) {
						category.data = y.func.loadXml(category.file);
					}
				},
				loadCategory: function () {
					var fp = y.func.loadXml(y.opt.categoryXml), category = fp.getElementsByTagName('category'), i, ln = category.length, j, jln, partner, pArr;
					for (i = 0; i < ln; i++) {
						y.dt.category.push({
							name: category[i].getAttribute('name'),
							file: category[i].getAttribute('file'),
							icon: category[i].getAttribute('icon'),
							name: category[i].getAttribute('name'),
							citysearch: category[i].getAttribute('citysearch'),
							data: null
						});
						pArr = [];
						partner = category[i].getElementsByTagName('partner');
						for (j = 0, jln = partner.length; j < jln; j++) {
							pArr[pArr.length] = {
								name: partner[j].getAttribute('name'),
								img: partner[j].getAttribute('img'),
								href: partner[j].getAttribute('href')
							};
						}
						y.dt.fp[category[i].getAttribute('name')] = pArr;
					}
				},
				createFp: function (category) {
					var $ol, $li, $a, i , ln, fp;
					y.obj.$featuredPartners.empty();
					if (y.dt.fp.hasOwnProperty(category)) {
						ln = y.dt.fp[category].length;
						if (ln > 0){
							$('<h4/>').text('Featured Partners').appendTo(y.obj.$featuredPartners);
							$ol = $('<ol/>').addClass('list-unstyled');
							for (i = 0; i < ln; i++) {
								fp = y.dt.fp[category][i];
								$li = $('<li/>');
								$a = $('<a/>').attr('href', fp.href).text(fp.name).click(function(e){
									y.obj.$filterText.val(this.innerHTML);
									y.evnt.searchData(e);
								});
								/*$('<img/>').attr({alt: fp.name, src: 'images/featured-partners/' + fp.img}).addClass('img-thumbnail').appendTo($a);*/								
								$a.appendTo($li);
								$li.appendTo($ol);
							}
							$ol.appendTo(y.obj.$featuredPartners);
						}
					}
				},
				createCategoryNav: function () {
					var $ul = $('<ul/>').addClass('navbar-nav'), $li, $a, text;
					for (var i = 0, ln = y.dt.category.length; i < ln; i++) {
						$li = $('<li/>');
						text = y.dt.category[i].name;
						$a = $('<a/>').data('i',i).attr({href: '#', name: text}).addClass(y.dt.category[i].icon).html('<span></span>'+text).appendTo($li);
						y.obj.$catA.push($a[0]);
						$li.appendTo($ul);
					}
					if ('home' == y.opt.page) {
						y.obj.$catA.click(function(e) {
							y.evnt.selectCategoryHome(e, this);
						})
					}
					else {
						$ul.addClass('nav navbar-right');
						y.obj.$catA.click(function(e) {
							y.evnt.selectCategory(e, this);
						})
					}
					$ul.appendTo(y.obj.$category);
				},
				createCityTopFilter: function () {
					var $option;
					if (false === y.vr.getCity) {
						y.dt.city = y.func.getCityList(y.func.loadXml(y.opt.cityXml));
						y.vr.getCity = true;
					}
					y.obj.$cityTopFilter = $('<select/>').change(function() {
						y.evnt.changeCity(this);
					});
					$('<option/>').val('').text('Choose your City').appendTo(y.obj.$cityTopFilter);
					for (var i = 0, ln = y.dt.city.length; i < ln; i++) {
						$('<option/>').val(y.dt.city[i].toLowerCase()).text(y.dt.city[i]).appendTo(y.obj.$cityTopFilter);
					}
					y.obj.$cityTopFilter.appendTo(y.obj.$city.children('div.filter'));
					y.obj.$cityTopDisplay = y.obj.$city.children('div.display');
				},
				createCityFilterDialog: function() {
					var $option;
					if (false === y.vr.getCity) {
						y.dt.city = y.func.getCityList(y.func.loadXml(y.opt.cityXml));
						y.vr.getCity = true;
					}
					y.obj.$cityDialogSelect = $('<select/>').attr('id','cities').change(function() {						
						y.evnt.changeCity(this);
					});
					$('<option/>').val('').text('Choose your City').appendTo(y.obj.$cityDialogSelect);
					for (var i = 0, ln = y.dt.city.length; i < ln; i++) {
						$('<option/>').val(y.dt.city[i].toLowerCase()).text(y.dt.city[i]).appendTo(y.obj.$cityDialogSelect);
					}
					y.obj.$cityDialogSelect.prependTo(y.obj.$cityDialogForm);
				},
				createCityFilter: function() {
					var $select, $option;
					$select = $('<select/>').addClass('a-filter').change(function() {						
						y.evnt.filterCity(this);
					});
					$('<option/>').val('').text('City').appendTo($select);
					for (var i = 0, ln = y.dt.city.length; i < ln; i++) {
						$('<option/>').val(y.dt.city[i].toLowerCase()).text(y.dt.city[i]).appendTo($select);
					}
					y.obj.$filterCity = $select.appendTo(y.obj.$filterCity);
					if (void 0 != y.vr.selectedCity) {
						y.obj.$filterCity.val(y.vr.selectedCity.toLowerCase()).change();
					}
				},
				createCategotyFilter: function() {
					var $select, $option;
					$select = $('<select/>').addClass('a-filter').change(function() {
						$('.input-filter').val('');
						y.evnt.filterCategory(this);
						y.func.settitle(this);
					});
					//$('<option/>').val('').text('Category').appendTo($select);
					for (var i = 0, ln = y.dt.category.length; i < ln; i++) {
						var text = y.dt.category[i].name;
						$('<option/>').val(text).text(text).appendTo($select);
					}
					y.obj.$filterCategory = $select.appendTo(y.obj.$filterCategory);
				},
				createTextFilter: function() {
					y.obj.$filterText = $('<input/>').attr({'placeholder':'Search','type':'text'}).addClass('input-filter').appendTo(y.obj.$filterText);
				},
				createButtonFilter: function() {
					// find button
					var $filter = $('<input/>').attr({'type':'submit'}).val('').addClass('button-filter').appendTo(y.obj.$filterButton);
					$filter.parents('form').submit(function (e) {
						y.evnt.searchData(e);
					});
					y.obj.$filterButton = $filter;
				},
				createFavouriteButton: function() {
					// filter button
					$('<input/>').attr({'type':'button'}).addClass('button-fav favbtn').click(function () {
						y.evnt.showFav();
					}).appendTo(y.obj.$filterFavourite);
				},
				getCityList: function(cityXml) {
					var cityArr = [], city = cityXml.getElementsByTagName('Data'), cityLn = city.length, i, childNodes;
					for (i = 0; i < cityLn; i++) {
						childNodes = city[i].childNodes;
						if (childNodes.length > 0) {
							cityArr[cityArr.length] = childNodes[0].nodeValue;
						}
					}
					return cityArr;
				},
				filterData: function(action) {
					if ('' == $.trim(y.vr.selectedCategory)) {
						alert('Please Choose Category');
						return false;
					}
					else {
						var $data = y.func.dataListing(action);
						if ($data[0]) {
							y.obj.$filterData.empty();
							$('<h2/>').addClass('header-filter').text(y.vr.selectedCategory).appendTo(y.obj.$filterData);
							y.obj.$dataDiv = $('<div/>').addClass('data-filter').appendTo(y.obj.$filterData);
							//$('<img/>').attr({src:'img/ajax-loader.gif'}).addClass('loading').appendTo(y.obj.$dataDiv);
							$data[1].appendTo(y.obj.$dataDiv);
						}
						else {
							if ('prev' == action) {
								$('button.prev').attr('disabled', 'disabled').addClass('disabled');
								y.opt.start = y.opt.end;
								y.opt.end = y.opt.backupEnd;
							}
							else {
								y.obj.$filterData.empty();
								$('<h2/>').addClass('header-filter').text(y.vr.selectedCategory).appendTo(y.obj.$filterData);
								y.obj.$dataDiv = $('<div/>').addClass('data-filter').appendTo(y.obj.$filterData);
								$('<div/>').addClass('error-msg').text('No Result Found.').appendTo(y.obj.$dataDiv);
							}
						}
					}
				},
				dataListing: function(action) {
					var category = y.dt.category[y.vr.selectedCategoryIndex], row = [] , i, ln = 0,
					$div = $('<ul/>'), $dt, regX = null, regText = '', dDiv,
					filterText = $.trim(y.obj.$filterText.val()), end, found = false;
					y.func.loadData(category)
					if (void 0 != category.data) {
						row = category.data.getElementsByTagName('Row');
						ln = row.length;
					}
					if ('' != y.vr.selectedCity || '' != filterText) {
						if ('' != y.vr.selectedCity && '0' != category.citysearch) {
							if ('2' == category.citysearch) {
								regText += '(?=.*' + y.vr.selectedCity + '|.*' + y.opt.ignoreCity + ')';
							}
							else {
								regText += '(?=.*' + y.vr.selectedCity + ')';
							}
						}
						if ('' != filterText) {
							regText += '(?=.*' + filterText + ')';
						}
						regX = new RegExp(regText,'i');
					}
					if (void 0 == action) {
						y.opt.start = 0;
						y.opt.end = 0;
					}
					y.opt.counter = 0;
					if ('prev' == action) {
						y.opt.backupEnd = y.opt.end;
						y.opt.end = y.opt.start
						for (i = y.opt.start-1; i >= 0; i--) {
							dDiv = y.func.dataDiv(row[i], regX, action);
							if (dDiv[0]) {
								found = true;
								dDiv[1].prependTo($div);
							}
							if (y.opt.counter >= y.opt.total) {
								break;
							}
						}
						y.opt.start = i
					}
					else {
						y.opt.start = y.opt.end
						for (i = y.opt.end; i < ln; i++) {
							dDiv = y.func.dataDiv(row[i], regX, action);
							if (dDiv[0]) {
								found = true;
								dDiv[1].appendTo($div);
							}
							if (y.opt.counter >= y.opt.total) {
								i++;
								break;
							}
						}
						y.opt.end = i;
					}
					//console.log('start: ' + y.opt.start);
					//console.log('end: ' + y.opt.end);
					$dt = $('<ul/>').addClass('pager');
					$li = $('<li/>');
					y.obj.$prevButton = $('<a/>').attr('href', '#').addClass('prev').text('Prev').click(function (e) {
						y.evnt.prevDataListing(e, this);
					}).appendTo($li);
					$li.appendTo($dt);
					$li = $('<li/>');
					y.obj.$nextButton = $('<a/>').attr('href', '#').addClass('next').text('Next').click(function (e) {
						y.evnt.nextDataListing(e, this);
					}).appendTo($li);
					$li.appendTo($dt);
					if (y.opt.start <= 0) {
						y.obj.$prevButton.attr('disabled', 'disabled').addClass('disabled');
					}
					if (y.opt.end >= ln) {
						y.obj.$nextButton.attr('disabled', 'disabled').addClass('disabled');
					}
					$dt.appendTo($div);
					return [found, $div];
				},
				dataDiv: function(row, regX, action) {
					var data = row.getElementsByTagName('Data'), found = false,
					dataLn = data.length, key, $span, $dt, sText = '', html, childNodes;
					$dt = $('<li/>').addClass('dt');
					for (key in y.opt.cell) {
						if (dataLn > key) {
							childNodes = data[key].childNodes
							if (childNodes.length > 0) {
								html = childNodes[0].nodeValue;
							}
							else {
								html = '';
							}
							var spn = $('<span/>').addClass(y.opt.cell[key]).html(html).appendTo($dt);
							sText += html;
						}
						else {
							continue;
						}
					}
					if (void 0 == regX || (void 0 != regX && void 0 != sText.match(regX))) {
						// category
						$span = $('<span/>').addClass('cat');
						$('<span/>').html('Category: ').appendTo($span);
						$('<a/>').attr('href','#').html(y.vr.selectedCategory).appendTo($span);
						$span.appendTo($dt);
						$('<img/>').addClass('sharebutton').css({'height':'20','width':'56'}).attr('src','images/share.gif').appendTo($dt);
						$('<img/>').css({'height':'22','width':'118'}).attr('src','images/add.gif').appendTo($('<a/>').attr('href','#').addClass('fav').click(function(e){
							y.evnt.addFav(e, this);
						}).appendTo($dt));
						found = true;
						y.opt.counter++;
					}
					return [found, $dt];
				},
				addFav: function($obj) {
					var $div = $obj.parent().clone(), totalDiv = $.cookie('t') || 0;
					$div.children('a.fav').remove();
					totalDiv = parseInt(totalDiv, 10);
					if (totalDiv >= 10) {
						alert('Add Favourites limit exceeded.')
					}
					else {
						$.cookie(totalDiv,$div.html());
						$.cookie('t',++totalDiv);
						alert('Favourites added successfully');
					}
				},
				showFav: function () {
					//y.obj.$filterCity.val('').change();
					//y.obj.$filterText.val('');
					//y.obj.$filterCategory.val('').change();
					if ('home' == y.opt.page) {
						location.href = 'search.html?fav=true';
					}
					else {
						y.obj.$filterData.empty();
						$('<h2/>').addClass('header-filter').text('My Favourites').appendTo(y.obj.$filterData);
						y.obj.$dataDiv = $('<div/>').addClass('data-filter').appendTo(y.obj.$filterData);
						var totalDiv = $.cookie('t') || 0, i, $ul;
						totalDiv = parseInt(totalDiv, 10);
						$ul = $('<ul/>');
						if (totalDiv > 0) {
							for (i = 0; i < totalDiv; i++) {
								$('<input/>').data('i',i).attr('type','button').addClass('delbtn').val('Delete').click(function() {
									y.evnt.delFav(this);
								}).appendTo($('<li>' + $.cookie(i) + '</li>').appendTo($ul));
							}
							$ul.appendTo(y.obj.$dataDiv);
						}
						else {
							$('<div/>').addClass('error-msg').text('No Favourite exist.').appendTo(y.obj.$dataDiv);
						}
						y.vr.fav = '';
					}
				},
				delFav: function ($obj) {
					var index = $obj.data('i'), totalDiv = $.cookie('t') || 0;
					totalDiv = parseInt(totalDiv, 10);
					if (confirm('Are you sure you want to delete this Favourite?')) {
						totalDiv--;
						if (index != totalDiv) {
							$.cookie(index, $.cookie(totalDiv));
						}
						$.cookie(totalDiv, null);
						$.cookie('t', totalDiv);
						$obj.parent().remove();
					}
				},
				getParam: function (name) {
					name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
					var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
					results = regex.exec(location.search);
					return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
				},
				settitle: function(me){
					
					$('title').text('American Express Monthly Blockbuster Offer - ' + me.value);
				}
			},
			evnt: {
				changeCity: function (me) {
					var $me = $(me);	
				    if($me.val()=='-------------'){
						$me.val('');
						return false;
					}
					if ('home' == y.opt.page) {
						y.evnt.filterCity(me);
					}
					else {
						y.obj.$filterCity.val($me.val()).change();
					}
				},
				filterCity: function (me) {
					var $me = $(me);
					y.obj.$cityTopFilter.val($me.val());
					y.vr.selectedCity = y.obj.$filterCity.val();
					y.obj.$cityTopDisplay.text($me.children('option:selected').text());
					$.cookie('ct', $me.val());
					y.obj.$homeCity.length > 0 && y.obj.$homeCity.val($me.val());
				},
				filterCategory: function(me) {
					var $me = $(me), $a = $('a[name="' + $me.val() + '"]');
					if ($a.length > 0) {
						$a.click();
					}
					else {
						y.obj.$catA.removeClass('active');
						y.vr.selectedCategory = '';
						y.vr.selectedCategoryIndex = 0;
					}
					y.func.settitle(me);
				},
				selectCategoryHome: function(e, me) {
					e.preventDefault();
					var $me = $(me), text = $me.text();
					$('.category-div').find('span').removeClass('active');
					$(me).find('span').addClass('active');
					y.obj.$catA.removeClass('active');
					$me.addClass('active');
					y.obj.$homeCategory.val(text);
					y.obj.$homeSearchForm.find('form').submit();					
					/*y.obj.$homeSearchForm.slideDown('slow');*/
				},
				selectCategory: function (e, me) {
					e.preventDefault();
					$('.input-filter').val('');
					var $me = $(me), text = $me.text();
					$('.category-div').find('span').removeClass('active');
					$(me).find('span').addClass('active');
					y.obj.$catA.removeClass('active');
					$me.addClass('active');
					//y.obj.$filterCity.val('').change();
					//y.obj.$filterText.val('');
					y.vr.selectedCategory = text;
					y.vr.selectedCategoryIndex = $me.data('i');
					y.obj.$filterCategory.val(text);
					y.func.createFp(text);
					if ('' == y.vr.fav) {
						y.func.filterData();
					}
					
					y.func.settitle(y.obj.$filterCategory[0]);
				},
				searchData: function (e) {
					e.preventDefault();
					y.func.filterData();
				},
				prevDataListing: function (e, me) {
					e.preventDefault();
					var $this = $(me), isDisable = $this.attr('disabled');
					if (void 0 == isDisable) {
						y.func.filterData('prev');
					}
					$('html, body').animate({scrollTop:100}, '500');
				},
				nextDataListing: function (e, me) {
					e.preventDefault();
					var $this = $(me), isDisable = $this.attr('disabled');
					if (void 0 == isDisable) {
						y.func.filterData('next');
					}
					$('html, body').animate({scrollTop:100}, '500');
				},
				addFav: function (e, me) {
					e.preventDefault();
					y.func.addFav($(me));
				},
				showFav: function () {
					y.func.showFav();
				},
				delFav: function (me) {
					y.func.delFav($(me));
				}
			}
		};
		y.func.init();
	}
})(jQuery);