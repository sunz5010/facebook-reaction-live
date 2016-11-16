//define
var access_token;
var videoId;
var refreshTimer;
var refreshTimerInterval;   //用來存下interval id
var url;

//準備reaction fields
var reactionFields = ["LIKE", "LOVE", "WOW", "HAHA", "SAD", "ANGRY"].map(function(item) {
    return "reactions.type("+item+").limit(0).summary(total_count).as("+item+")";
}).join(",");

//加入totalCount fields
reactionFields += ",reactions.limit(0).summary(total_count).as(totalCount)";

$(document).ready(function() {
    //第一次更新直播區塊
    refreshLiveContent();

    //文字顏色選擇器
    $('#textColorSelector').ColorPicker({
        color: '#ffffff',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            $('#textColorSelector div').css('backgroundColor', '#' + hex);
            $(".reaction-title").each(function() {
                $(this).css({
                    color: '#'+hex
                })
            });
        }
    });
    //讚數顏色選擇器
    $('#numberColorSelector').ColorPicker({
        color: '#ffffff',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            $('#numberColorSelector div').css('backgroundColor', '#' + hex);
            $(".reaction-number").each(function() {
                $(this).css({
                    color: '#'+hex
                })
            });
        }
    });

    //直播區塊更新事件
    $(".reaction-value-input").each(function() {
        $(this).change(function() {
            refreshLiveContent();
        });
    });
});
function startApplication() {
    //log
    console.log("start application.");

    //lock params
    lockParams();

    //抓取數值
    access_token = $("#accessToken").val();
    videoId = $("#videoId").val();
    refreshTimer = $("#refreshTimer").val();

    //準備fb api url
    url = "https://graph.facebook.com/v2.8/?ids=" + videoId + "&fields=" + reactionFields + "&access_token=" + access_token;

    //開始抓取
    fetchVideoReactions();  //啟動第一次
    refreshTimerInterval = setInterval(fetchVideoReactions, refreshTimer*1000);
}
function stopApplication() {
    //log
    console.log("stop application.");

    //clear interval
    clearInterval(refreshTimerInterval);

    //free params
    freeParams();
}
function fetchVideoReactions() {
    console.log("fetching facebook live video reactions...");
    $.ajax({
        url: url,
        success: function(response) {
            var datas = response[videoId] || undefined;
            if(datas) {
                //輸出各reaction數值
                for(reaction in datas) {
                    if(reactionFields.indexOf(reaction) != -1) {
                        $(".reaction-number[data-value="+reaction+"]").html(datas[reaction].summary.total_count);
                    }
                }

                //處理total count
                $("#totalCount").html(datas["totalCount"].summary.total_count);
            }
        },
        error: function(response) {
            console.log("fetch data faild.");
            console.log("response:", response);
            alert("抓取失敗，檢查您的影片id，或者access token是否正確（或者過期）");
            stopApplication();
        }
    });
}
function lockParams() {
    $("#clickButton").html("停止");
    $("#clickButton").attr("onclick", "stopApplication()");
    $("#videoId").attr("readonly", true);
    $("#accessToken").attr("readonly", true);
    $("#refreshTimer").attr("readonly", true);
}
function freeParams() {
    $("#videoId").attr("readonly", false);
    $("#accessToken").attr("readonly", false);
    $("#refreshTimer").attr("readonly", false);
    $("#clickButton").html("開始");
    $("#clickButton").attr("onclick", "startApplication()");
}
function refreshLiveContent() {
    //標題
    $("#live-title").html($("#title").val());

    //整個的背景圖片
    $("#live-content").css({
        "background-image": "url("+$("#backgroundImage").val()+")"
    });

    //每個圖示的文＋圖
    $(".reaction-value-input").each(function() {
        if($(this).attr("data-type") == "text") {
            //文字類
            $(".reaction-title[value="+$(this).attr("data-value")+"]").html($(this).val());
        }
        else if ($(this).attr("data-type") == "image"){
            //圖片類
            $(".reaction-image[value="+$(this).attr("data-value")+"] img").attr("src", $(this).val());
        }
    });
}