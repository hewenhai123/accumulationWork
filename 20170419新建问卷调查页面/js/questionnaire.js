$(function() {
	function subData() {
		var about_brand = [],
			about_shoes = [],
			questionnaireData = [];

		//			{
		//				"about_brand": about_brand,
		//				"about_shoes": about_shoes
		//			};

		$(".auto_brand").find("input").each(function() {
			var nameList = $(this).attr("name").split("-");
			var tempObj = {};
			tempObj[nameList[1]] = $(this).val();
			about_brand[about_brand.length] = tempObj;
		});
		$(".about_shoes").children("div").each(function() {
			if($(this).hasClass("_remark")) {
				return true
			}
			getdata(this);
		});

		function getdata(ele) {
			var obj = {},
				ary = [],
				nameList = [];
			$(ele).find("input").each(function() {
				nameList = $(this).attr("name").split("-"), $cuEle = $(this);
				obj[nameList[1]] = ary;
				if(nameList.length == 3) {
					if($cuEle.attr("type") == "checkbox" && $cuEle.is(":checked")) {
						ary[ary.length] = nameList[2];
						obj[nameList[1]] = ary;
					}
				}
				if(nameList.length == 2) {
					obj[nameList[1]] = $cuEle.val();
				}
			})
			about_shoes[about_shoes.length] = obj;
		};

		$(".item").each(function() {
			var obj = {},
				ary = [],
				nameList = [];
			$(this).find("input").each(function() {
				nameList = $(this).attr("name").split("-"), $cuEle = $(this);
				obj[nameList[2]] = [0];
				if($cuEle.is(":checked")) {
					ary[ary.length] = nameList[3];
				}

			})
			ary.length == 0 ? obj[nameList[2]] = 0 : obj[nameList[2]] = ary;
			about_shoes[4]["shoe_material"].push(obj);
		});
		questionnaireData.push({
			"opinion_suggestion": $("textarea").val()
		});
		questionnaireData.push({
			"about_brand": about_brand
		});
		questionnaireData.push({
			"about_shoes": about_shoes
		});
		console.dir(about_shoes)
		$.ajax({
			url: "/okok",
			type: "post",
			data: {
				"questionnaire": questionnaireData
			},
			success: function(res) {
				swal({
					title: '提交成功',
					type: 'info',
					showConfirmButton: false,
					showLoaderOnConfirm: true,
					allowOutsideClick: false,
					allowEscapeKey: false
				});
				setTimeout(function() {
					swal.close();
					//跳转放在这里
				}, 2000);
			},
			error: function(error) {
				console.log(error)
			}

		});

	}

	subData();
	$("._sub").click(function() {
		swal({
			title: '提交中',
			type: 'warning',
			text:'请等候',
			showConfirmButton: false,
			showLoaderOnConfirm: true,
			allowOutsideClick: false,
			allowEscapeKey: false
		});

		subData();
	});
	$(".textarea_box").keyup(function() {
		var sHeight = this.scrollHeight;
		if(sHeight > this.clientHeight) {
			$(this).height(sHeight)
		}
	});
});