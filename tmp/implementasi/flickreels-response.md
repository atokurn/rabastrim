# home

curl -X 'GET' \
  'https://dramabox-api-test.vercel.app/api/flickreels/home' \
  -H 'accept: */*'

```json
{
  "success": true,
  "message": "Berhasil mengambil data home",
  "data": {
    "status_code": 1,
    "msg": "成功",
    "data": [
      {
        "id": "30",
        "name": "home",
        "home_status": "1",
        "navigation_tag_id": "0",
        "is_home": 0
      },
      {
        "id": "78",
        "name": "Baru",
        "home_status": "0",
        "navigation_tag_id": "0",
        "is_home": 0
      },
      {
        "id": "454",
        "name": "Peringkat",
        "home_status": "2",
        "navigation_tag_id": "0",
        "is_home": 0
      },
      {
        "id": "387",
        "name": "🎄Selamat Natal✨",
        "home_status": "0",
        "navigation_tag_id": "0",
        "is_home": 0
      },
      {
        "id": "88",
        "name": "Romantis",
        "home_status": "0",
        "navigation_tag_id": "0",
        "is_home": 0
      }
    ],
    "extra": {},
    "request_id": "2c2ed0f75cbe4c6bd3afa25eb7ff4d67",
    "trace_id": "7ca3f08b6f4fde17861866523e1ee9b0"
  },
  "timestamp": "2026-01-01T06:31:55.251Z"
}
```

#  For You

curl -X 'GET' \
  'https://dramabox-api-test.vercel.app/api/flickreels/foryou' \
  -H 'accept: */*'

```json
{
  "success": true,
  "message": "Berhasil mengambil rekomendasi",
  "data": {
    "status_code": 1,
    "msg": "成功",
    "data": {
      "list": [
        {
          "playlet_id": "4464",
          "playlet_title": "Masa Bersinarku",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765360492_J8FZPp2JnN.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765360492_J8FZPp2JnN.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 81,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/471268ddc3ce633b354ca0281c725c71.webp?verify=1767335616-OMxboXsHVCeLxnIOxyN8tMB1xn9XFPCW8hU0q54DIbQ%3D",
              "duration": 253,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/1765336517_hls_26421.m3u8?verify=1767252816-pOAUEjx7Nc5vR16kWzm6X3nrN6La8Y0yzivDhJbh9XU%3D",
              "down_url": "/playlet-hls/1765336517_hls_26421.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "4464",
              "chapter_title": "Masa Bersinarku-EP.1",
              "chapter_id": "315586",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Masa Bersinarku"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/9be8052529cdd5eba1ce4851152733a2.webp?verify=1767335616-C9iACPJMyvaMfaXTq3x2NigQAg5JmTwkHj2BxZpxpew%3D",
              "duration": 197,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet-hls/1765336517_hls_41419.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "4464",
              "chapter_title": "Masa Bersinarku-EP.2",
              "chapter_id": "315587",
              "e_refer_reel_episode": "315586",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Masa Bersinarku"
            }
          ],
          "tag_list": [
            {
              "tag_id": 1762,
              "tag_name": "Manis"
            },
            {
              "tag_id": 1842,
              "tag_name": "Beda Usia"
            }
          ],
          "rank_type": 3,
          "rank_tag": "Trending No.2",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_f4KyjxqZpY03rw7P.png",
          "praise_num": "140.3K",
          "alg_id": 0
        },
        {
          "playlet_id": "4784",
          "playlet_title": "Menaklukkan Suami Nakal",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766741407_EM5Chj357Q.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766741407_EM5Chj357Q.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 77,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/6203d92155d62a2baedd435d7617a3f5.webp?verify=1767335616-ZXc7Ps%2FW97A2HTPPA0uTVgiLVHT63j7S262bmztCeUA%3D",
              "duration": 166,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/1766651399_hls_72914.m3u8?verify=1767252816-P%2B5TABN%2Fg5E%2FZcTso26bYpi69OBi7%2F23Ua4UVSaCGBo%3D",
              "down_url": "/playlet-hls/1766651399_hls_72914.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "4784",
              "chapter_title": "Menaklukkan Suami Nakal-EP.1",
              "chapter_id": "337842",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Menaklukkan Suami Nakal"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/becd7947caca36bb6ab005ead8ee0339.webp?verify=1767335616-GkNO8LBOOzcFvGV0LaVbey5Tlnf%2FB3j7xMgY3SNz%2Bpc%3D",
              "duration": 102,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet-hls/1766651399_hls_24178.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "4784",
              "chapter_title": "Menaklukkan Suami Nakal-EP.2",
              "chapter_id": "337843",
              "e_refer_reel_episode": "337842",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Menaklukkan Suami Nakal"
            }
          ],
          "tag_list": [
            {
              "tag_id": 2307,
              "tag_name": "Komedi Ringan​"
            },
            {
              "tag_id": 1826,
              "tag_name": "Nikah Dulu"
            }
          ],
          "rank_type": 3,
          "rank_tag": "Trending No.3",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_f4KyjxqZpY03rw7P.png",
          "praise_num": "388.2K",
          "alg_id": 0
        },
        {
          "playlet_id": "533",
          "playlet_title": "Menikah lagi dengan Ketua Direksi(Dubbing)",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739958696_ie6sC65hBK.png",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739958696_ie6sC65hBK.png?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 69,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/8e0e823c43b98b8ab2897c797c9c2351.jpg?verify=1767335616-OrFWEOmlT%2FjBH2YTEFKE%2FPNQP9rzkh2WPHAD5yHaGi0%3D",
              "duration": 124,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/hls_1739959557_1_78247.m3u8?verify=1767252816-SGb%2Ba3uYYYTtCIoSiDQsfZJdjfjJjVponNRiMc23lhs%3D",
              "down_url": "/undefined1739959572276_7977473d_1.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "533",
              "chapter_title": "Menikah lagi dengan Ketua Direksi(Dubbing)-EP.1",
              "chapter_id": "42499",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Menikah lagi dengan Ketua Direksi(Dubbing)"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/61db6788db2834abe91a32f98d4b5593.jpg?verify=1767335616-j%2Fncm8s%2BZSC8ySoMsByEqpB2cyIAQXSv67o4IF6a%2F8E%3D",
              "duration": 100,
              "introduce": "",
              "hls_url": "",
              "down_url": "/undefined1739958724799_bd5a0087_2.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "533",
              "chapter_title": "Menikah lagi dengan Ketua Direksi(Dubbing)-EP.2",
              "chapter_id": "42500",
              "e_refer_reel_episode": "42499",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Menikah lagi dengan Ketua Direksi(Dubbing)"
            }
          ],
          "tag_list": [
            {
              "tag_id": 1663,
              "tag_name": "Paruh Baya"
            },
            {
              "tag_id": 1746,
              "tag_name": "Nikah Kilat"
            }
          ],
          "rank_type": 3,
          "rank_tag": "Trending No.17",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_D2rShGL4bO0xjBQQ.png",
          "praise_num": "930.2K",
          "alg_id": 0
        },
        {
          "playlet_id": "894",
          "playlet_title": "Adik lpar Memanjakanku（Dubbing）",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1743422293_RPhQR7CDJF.png",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1743422293_RPhQR7CDJF.png?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 52,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/0e56f33c4ab15dfe23357d646abe79d7.jpg?verify=1767335616-qLc%2BacVlEIid%2FRw1um9wAJz2jHPGqfMBeZ1RRWAEar0%3D",
              "duration": 146,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/hls_1743422396_1_34251.m3u8?verify=1767252816-820ieMA9gzj4urCchsvoFMvogo9PKLrTSGqLBN%2BJcZE%3D",
              "down_url": "/playlet/1743422378224_b8c6fe58_1.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "894",
              "chapter_title": "Adik lpar Memanjakanku（Dubbing）-EP.1",
              "chapter_id": "68993",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Adik lpar Memanjakanku（Dubbing）"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/07d06bea6c96b48177b08483fb7147e3.jpg?verify=1767335616-KjYQMifBtjxbclp8vSaHbcZ5LscCo%2Brd4yZRMhxYvfw%3D",
              "duration": 138,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet/1743422378225_c606b81a_2.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "894",
              "chapter_title": "Adik lpar Memanjakanku（Dubbing）-EP.2",
              "chapter_id": "68994",
              "e_refer_reel_episode": "68993",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Adik lpar Memanjakanku（Dubbing）"
            }
          ],
          "tag_list": [
            {
              "tag_id": 2274,
              "tag_name": "​​Balas Dendam"
            },
            {
              "tag_id": 1778,
              "tag_name": "Terlarang"
            }
          ],
          "rank_type": 1,
          "rank_tag": "Serial Hot No.5",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_D2rShGL4bO0xjBQQ.png",
          "praise_num": "85.7K",
          "alg_id": 0
        },
        {
          "playlet_id": "4187",
          "playlet_title": "Nyonya Muda Si Mulut Sial",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763977097_ByYBYPNMWk.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763977097_ByYBYPNMWk.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 80,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/5184c04678cd3639a88c424da0635beb.webp?verify=1767335616-wbjqTJZpZBngWegbfNiu28Q%2FLgp2IfGew%2FVnAG%2BKlcE%3D",
              "duration": 161,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/1763794419_hls_50662.m3u8?verify=1767252816-T4GeT7VOebepTU7sOf7lxlsZGC64kWY6P1LpbjeM53s%3D",
              "down_url": "/playlet-hls/1763794419_hls_50662.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "4187",
              "chapter_title": "Nyonya Muda Si Mulut Sial-EP.1",
              "chapter_id": "295665",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Nyonya Muda Si Mulut Sial"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/b742f7f7aeb6139e54de546e240de5b2.webp?verify=1767335616-R%2BJYZxs6mjpy6S1dLCUb9qYkfB7rGTyZWmBnHJN7bZE%3D",
              "duration": 202,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet-hls/1763794419_hls_48569.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "4187",
              "chapter_title": "Nyonya Muda Si Mulut Sial-EP.2",
              "chapter_id": "295666",
              "e_refer_reel_episode": "295665",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Nyonya Muda Si Mulut Sial"
            }
          ],
          "tag_list": [
            {
              "tag_id": 2307,
              "tag_name": "Komedi Ringan​"
            },
            {
              "tag_id": 1504,
              "tag_name": "Romantis"
            }
          ],
          "rank_type": 3,
          "rank_tag": "Trending No.14",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_v754xyA8PJjRCvy4.png",
          "praise_num": "219.4K",
          "alg_id": 0
        },
        {
          "playlet_id": "3108",
          "playlet_title": "Ayah Pacarku, Suamiku",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1758184949_aS3nfwTBky.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1758184949_aS3nfwTBky.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 88,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/2e3fe3b5ae1883707bd6b0745c7e11e0.webp?verify=1767335616-h%2FGi35EGTWC7Z3uuxcgo7JLNqRLJYK8mwr9grIsKaqM%3D",
              "duration": 190,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/1758188785_hls_81959.m3u8?verify=1767252816-JeEWszrjzyZjH2GfnRyLGyCNJATNORdzsh4Rt%2BQ1GiY%3D",
              "down_url": "/playlet-hls/1758188785_hls_81959.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "3108",
              "chapter_title": "Ayah Pacarku, Suamiku-EP.1",
              "chapter_id": "220158",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Ayah Pacarku, Suamiku"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/390044d7766954c60acfe1eda80927ca.webp?verify=1767335616-AJoH7gR9TD8yXv6svpT991%2B77hYOloIMiaILJmFwLDo%3D",
              "duration": 126,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet-hls/1758188785_hls_85087.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "3108",
              "chapter_title": "Ayah Pacarku, Suamiku-EP.2",
              "chapter_id": "220159",
              "e_refer_reel_episode": "220158",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Ayah Pacarku, Suamiku"
            }
          ],
          "tag_list": [
            {
              "tag_id": 1842,
              "tag_name": "Beda Usia"
            },
            {
              "tag_id": 1850,
              "tag_name": "Penebusan"
            }
          ],
          "rank_type": 0,
          "rank_tag": "",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_v754xyA8PJjRCvy4.png",
          "praise_num": "542.5K",
          "alg_id": 0
        },
        {
          "playlet_id": "2858",
          "playlet_title": "Tak Bisa Melepasmu",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1756890174_bmneDakEEe.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1756890174_bmneDakEEe.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 80,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/ab37afc6bc3f23b7c2d7043b2e03a8f2.webp?verify=1767335616-D7MbkvwwUUqknfdRUSNx4BYkom9PFQgpv1GvFsqg1i0%3D",
              "duration": 158,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/1756806615_hls_61025.m3u8?verify=1767252816-%2B9sJYyojx1UVYGoxLwqpxnlaXxETqUpA0OtajCvMlE0%3D",
              "down_url": "/playlet-hls/1756806615_hls_61025.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "2858",
              "chapter_title": "Tak Bisa Melepasmu-EP.1",
              "chapter_id": "201356",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Tak Bisa Melepasmu"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/5eaf3f45a47411d534287f6eed54184f.webp?verify=1767335616-sImeBHYmVKsgFMY%2BxWseyU2WYXCvuv5g%2FLTtSWSSPOc%3D",
              "duration": 150,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet-hls/1756806615_hls_29636.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "2858",
              "chapter_title": "Tak Bisa Melepasmu-EP.2",
              "chapter_id": "201357",
              "e_refer_reel_episode": "201356",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Tak Bisa Melepasmu"
            }
          ],
          "tag_list": [
            {
              "tag_id": 1730,
              "tag_name": "Hubungan Kontrak"
            },
            {
              "tag_id": 1826,
              "tag_name": "Nikah Dulu"
            }
          ],
          "rank_type": 0,
          "rank_tag": "",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_v754xyA8PJjRCvy4.png",
          "praise_num": "869.4K",
          "alg_id": 0
        },
        {
          "playlet_id": "2537",
          "playlet_title": "Nikah Kontrak Berujung Cinta",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1755250892_TQAPmGr8Rz.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1755250892_TQAPmGr8Rz.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 71,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/d8b17dd5ca150aef444a6a3156fcc131.webp?verify=1767335616-m3zLkfQ3zGpIvQhZrGCXfg%2FGb2%2BfR5ceaf%2FV1Tu11eA%3D",
              "duration": 177,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/1755160309_hls_39333.m3u8?verify=1767252816-oeFi%2FHaAr3UI0pwStjD%2BF4mQKaY9V0IAxfllMl0ErJY%3D",
              "down_url": "/playlet-hls/1755160309_hls_39333.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "2537",
              "chapter_title": "Nikah Kontrak Berujung Cinta-EP.1",
              "chapter_id": "179769",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Nikah Kontrak Berujung Cinta"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/c6d75c1df3f9bb3464555665f033c2c0.webp?verify=1767335616-XLYdWfae6lYSg%2FICgx%2BhsSvOZX3bY6p7M6hONYF%2Filc%3D",
              "duration": 152,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet-hls/1755160309_hls_88791.m3u8",
              "hls_status": "1",
              "resolution": "1",
              "playlet_id": "2537",
              "chapter_title": "Nikah Kontrak Berujung Cinta-EP.2",
              "chapter_id": "179770",
              "e_refer_reel_episode": "179769",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Nikah Kontrak Berujung Cinta"
            }
          ],
          "tag_list": [
            {
              "tag_id": 1738,
              "tag_name": "Cinta Semalam"
            },
            {
              "tag_id": 1818,
              "tag_name": "Salah Paham"
            }
          ],
          "rank_type": 1,
          "rank_tag": "Serial Hot No.15",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_v754xyA8PJjRCvy4.png",
          "praise_num": "25.3K",
          "alg_id": 0
        },
        {
          "playlet_id": "963",
          "playlet_title": "Kejayaanku Setelah Berpisah",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1744078502_8QdYySGE6K.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1744078502_8QdYySGE6K.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 65,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/306a8c201e1c74fe998e2a47b100e376.jpg?verify=1767335616-%2BnpRgGUHgsaqkE1IYZ551m0%2FUgPJTzvTVx62sAyuO3c%3D",
              "duration": 213,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/hls_1744078700_1_37714.m3u8?verify=1767252816-o1bsIqZqJi2YfKURSKI3glITtqyVsQG%2F9N7rXqanocA%3D",
              "down_url": "/playlet/1744078529703_b83950c0_1.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "963",
              "chapter_title": "Kejayaanku Setelah Berpisah-EP.1",
              "chapter_id": "73115",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Kejayaanku Setelah Berpisah"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/63f2c7484ac009e6ace3d59a2a7a381f.jpg?verify=1767335616-hyVUO8chZnUJBs2fBtK84Ym87v7P%2FYODeXMFdvuSzzs%3D",
              "duration": 129,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet/1744078529704_1329f1a7_2.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "963",
              "chapter_title": "Kejayaanku Setelah Berpisah-EP.2",
              "chapter_id": "73116",
              "e_refer_reel_episode": "73115",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Kejayaanku Setelah Berpisah"
            }
          ],
          "tag_list": [
            {
              "tag_id": 2274,
              "tag_name": "​​Balas Dendam"
            },
            {
              "tag_id": 1762,
              "tag_name": "Manis"
            }
          ],
          "rank_type": 3,
          "rank_tag": "Trending No.11",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_v754xyA8PJjRCvy4.png",
          "praise_num": "627.1K",
          "alg_id": 0
        },
        {
          "playlet_id": "1859",
          "playlet_title": "Sekata dalam Diam",
          "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1751446917_hEZ4BtTE4y.jpg",
          "process_cover": "https://zshipubcdn.farsunpteltd.com/playlet/1751446917_hEZ4BtTE4y.jpg?x-oss-process=image/resize,m_fill,w_180,h_234|image/sharpen,150",
          "chapter_num": 92,
          "is_collect": 0,
          "chapters": [
            {
              "chapter_num": 1,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/0dd556e640b19f2d2b04f6bc0bc77d7b.webp?verify=1767335616-6WGhfK31rYjbWINr06m%2BGRUNuwSmPjBuY%2FoQdKxe63k%3D",
              "duration": 155,
              "introduce": "",
              "hls_url": "https://zshipricf.farsunpteltd.com/playlet-hls/hls_1751444004_1_85847.m3u8?verify=1767252816-%2BmRlBZ2%2F8mihkX7jszT4NAq7UnX6J60bly0SfsmYGEE%3D",
              "down_url": "/playlet/1751443760018_99e4cb59_1.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "1859",
              "chapter_title": "Sekata dalam Diam-EP.1",
              "chapter_id": "133618",
              "e_refer_reel_episode": "0",
              "e_refer_reel_episode_num": 0,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Sekata dalam Diam"
            },
            {
              "chapter_num": 2,
              "chapter_cover": "https://zshipricf.farsunpteltd.com/playlet-hls-cover/1595b6037d5e37fb9d91f55bcad69147.webp?verify=1767335616-T7l2K%2FnFqhHKCXDmOz2Dy608eOqGPLsHUKbWc3R%2Bqws%3D",
              "duration": 60,
              "introduce": "",
              "hls_url": "",
              "down_url": "/playlet/1751443760018_c99427c8_2.mp4",
              "hls_status": "1",
              "resolution": "0",
              "playlet_id": "1859",
              "chapter_title": "Sekata dalam Diam-EP.2",
              "chapter_id": "133619",
              "e_refer_reel_episode": "133618",
              "e_refer_reel_episode_num": 1,
              "e_is_attribution_reel": false,
              "e_is_pay_point": false,
              "e_is_last_free_episode": false,
              "e_play_type": "免费",
              "e_is_vip_episode": false,
              "e_VIP_level": "",
              "e_chapter_coins": 0,
              "playlet_title": "Sekata dalam Diam"
            }
          ],
          "tag_list": [
            {
              "tag_id": 1850,
              "tag_name": "Penebusan"
            },
            {
              "tag_id": 2307,
              "tag_name": "Komedi Ringan​"
            }
          ],
          "rank_type": 3,
          "rank_tag": "Trending No.4",
          "subscript_url": "https://zshipubcdn.farsunpteltd.com/playlet/1764729830_v754xyA8PJjRCvy4.png",
          "praise_num": "890.7K",
          "alg_id": 0
        }
      ],
      "page": "alkvZzUxNWU0VmhUM0lGYVpyTmgyZz09",
      "source": 3
    },
    "extra": {},
    "request_id": "69fab68bcf58e9824d1da24918252865",
    "trace_id": "5a20650950c9d6185b9b0e46350f1312"
  },
  "timestamp": "2026-01-01T06:33:36.607Z"
}

```
# Ranking

```json
{
  "success": true,
  "message": "Berhasil mengambil ranking",
  "data": {
    "status_code": 1,
    "msg": "成功",
    "data": [
      {
        "name": "Serial Hot",
        "rank_type": 1,
        "data": [
          {
            "playlet_id": "487",
            "hot_num": "2.5M",
            "rank_type": 1,
            "rank_order": 1,
            "cover_square": "",
            "gender_type": "2",
            "introduce": "Lily Benneth ke kota untuk mengunjungi adiknya, Nana, namun mendapati Nana hidup mewah dengan berpura-pura sebagai dirinya.\nSementara itu, Lily bekerja di restoran Grup Vuton, menghadapi tekanan dari Eldrik. Namun, dia menarik perhatian sang CEO, Vale Vuton. Kebenaran akhirnya terungkap oleh ibu angkatnya, Nana menerima konsekuensinya, dan Lily berakhir bahagia bersama Vale.",
            "id": "487",
            "app_tag_name": "",
            "subscript": "0",
            "app_tag_id": "0",
            "recommend_config_id": "54",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739501785_zsaF7GGDbb.jpg",
            "tag_name": [
              "Putri Palsu",
              "Pengkhianatan",
              "Kesadaran Perempuan​",
              "CEO/ Miliarder",
              "Cinderella",
              "Deng Lingshu",
              "Zeng Hui",
              "Romantis",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "2343",
                "name": "Putri Palsu",
                "base_id": "242",
                "sort": "0"
              },
              {
                "id": "1810",
                "name": "Pengkhianatan",
                "base_id": "197",
                "sort": "1"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "2"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "3"
              },
              {
                "id": "1671",
                "name": "Cinderella",
                "base_id": "179",
                "sort": "4"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "5"
              },
              {
                "id": "2508",
                "name": "Zeng Hui",
                "base_id": "257",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "title": "Cintaku Hadir Di Kehidupan Selanjutnya",
            "language_id": "6",
            "has_collection": "0",
            "production_type": "3",
            "status": "2",
            "playlet_status": "1",
            "upload_num": "77",
            "slogan": "",
            "chapter_split_version": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_Nz3DhH5jtKHBXOoH.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "533",
            "hot_num": "1.7M",
            "rank_type": 1,
            "rank_order": 2,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739958696_ie6sC65hBK.png",
            "status": "2",
            "id": "533",
            "tag_list_with_id": [
              {
                "id": "1663",
                "name": "Paruh Baya",
                "base_id": "178",
                "sort": "0"
              },
              {
                "id": "1746",
                "name": "Nikah Kilat",
                "base_id": "189",
                "sort": "1"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "2"
              },
              {
                "id": "1898",
                "name": "Terpisah Keluarga",
                "base_id": "208",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "upload_num": "69",
            "introduce": "Setelah Susi Darma bercerai dan anaknya hilang, dia pun membesarkan putranya seorang diri. Demi menyelamatkan putranya dan mendonorkan ginjal, putranya memilih ibunya dan bercerai. Di sisi lain, Susi Darma menolong seorang wanita dan malah dijodohkan dengan Pak Jonan, orang terkaya. Kemudian, mendapati wanita tersebut adalah putrinya yang lama menghilang. Akhirnya, mereka sekeluarga pun berkumpul kembali.",
            "title": "Menikah lagi dengan Ketua Direksi(Dubbing)",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_48.jpg",
            "tag_name": [
              "Paruh Baya",
              "Nikah Kilat",
              "Balik alur",
              "Terpisah Keluarga",
              "CEO/ Miliarder",
              "Keluarga",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "2",
            "recommend_config_id": "58",
            "chapter_split_version": "0",
            "subscript": "5",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_oXyiMlKQrlgqE05J.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4187",
            "hot_num": "1.6M",
            "rank_type": 1,
            "rank_order": 3,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763977097_ByYBYPNMWk.jpg",
            "status": "2",
            "id": "4187",
            "tag_list_with_id": [
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "0"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "1"
              },
              {
                "id": "1986",
                "name": "Dua tokoh kuat",
                "base_id": "219",
                "sort": "2"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "2442",
                "name": "Ma Xiaoyu",
                "base_id": "251",
                "sort": "5"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "upload_num": "80",
            "introduce": "Resti, ketua organisasi pembunuh, masuk ke novel dan jadi istri korban Yudi. Ia ingin cepat cerai dan kembali ke dunia nyata, tapi rencana gagal karena suara hatinya terbongkar. Ia terpaksa pura-pura manja sambil adu strategi, malah bikin Yudi jatuh cinta berat.",
            "title": "Nyonya Muda Si Mulut Sial",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1763977100_a54Xfcwwry.jpg",
            "tag_name": [
              "Komedi Ringan​",
              "Romantis",
              "Dua tokoh kuat",
              "Nikah Dulu",
              "CEO/ Miliarder",
              "Ma Xiaoyu",
              "Deng Lingshu",
              "Perkotaan"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_It74t3aiS8tTYsML.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4464",
            "hot_num": "1.5M",
            "rank_type": 1,
            "rank_order": 4,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765360492_J8FZPp2JnN.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765360496_HYNS6c7YJp.jpg",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "1842",
                "name": "Beda Usia",
                "base_id": "201",
                "sort": "1"
              },
              {
                "id": "1850",
                "name": "Penebusan",
                "base_id": "202",
                "sort": "2"
              },
              {
                "id": "1970",
                "name": "Karier",
                "base_id": "217",
                "sort": "3"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "4"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "5"
              },
              {
                "id": "2552",
                "name": "Zhao Tingyi",
                "base_id": "261",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "slogan": "",
            "title": "Masa Bersinarku",
            "upload_num": "81",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Manis",
              "Beda Usia",
              "Penebusan",
              "Karier",
              "Kesadaran Perempuan​",
              "CEO/ Miliarder",
              "Zhao Tingyi",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "2",
            "introduce": "Pada hari Mia Wijaya resmi jadi karyawan tetap, dia tiba-tiba dipecat dan bertemu Eko Utomo secara tak terduga, mengubah jalannya hidupnya. Berkat rekomendasi Eko, Mia berhasil mendapat kesempatan di perusahaan konsultan top Maxwell. Dengan ketangguhan luar biasa, dia berhasil bertahan dan berkembang, dari seorang pemula menjadi analis bisnis yang mandiri. Di tengah persaingan di kantor, Mia dan Eko saling menyukai dan akhirnya bersama. Menyadari bahwa di balik penampilan sempurna Eko, dia takut jatuh cinta dan tak bisa mengekspresikan perasaannya, Mia dengan kesabaran dan optimisme membimbingnya perlahan-lahan, membuka hatinya yang tertutup. Eko mulai mencoba melepaskan lapisan dingin itu, belajar untuk rileks, menerima ketidaksempurnaan dirinya, dan belajar mengekspresikan cinta.\n",
            "id": "4464",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_Bwx1x22Dkx1NqotL.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "894",
            "hot_num": "712.9K",
            "rank_type": 1,
            "rank_order": 5,
            "production_type": "2",
            "upload_num": "52",
            "id": "894",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "54",
            "slogan": "",
            "chapter_split_version": "0",
            "tag_name": [
              "​​Balas Dendam",
              "Terlarang",
              "Manis",
              "Cinderella",
              "CEO/ Miliarder",
              "Perkotaan",
              "Romantis",
              "Cai Xinyang"
            ],
            "title": "Adik lpar Memanjakanku（Dubbing）",
            "subscript": "5",
            "app_tag_name": "",
            "introduce": "Setelah kehilangan suaminya secara tak terduga, Jelita baru mengetahui bahwa suaminya ternyata adalah putra sulung keluarga terkaya. Dia kemudian dijemput oleh ibu mertuanya untuk tinggal di rumah Keluarga Sano. Di sana, dia sering berselisih dengan adik iparnya, lalu mereka menjadi pasangan yang saling benci, tapi juga saling suka. Meskipun demikian, keduanya selalu menahan perasaan masing-masing. Namun, setelah menghadapi sebuah krisis besar bersama, mereka akhirnya menyadari perasaan satu sama lain dan bersatu sebagai pasangan sejati.",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "2274",
                "name": "​​Balas Dendam",
                "base_id": "236",
                "sort": "0"
              },
              {
                "id": "1778",
                "name": "Terlarang",
                "base_id": "193",
                "sort": "1"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "2"
              },
              {
                "id": "1671",
                "name": "Cinderella",
                "base_id": "179",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "2745",
                "name": "Cai Xinyang",
                "base_id": "272",
                "sort": "7"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1743422293_RPhQR7CDJF.png",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_34.jpg",
            "app_tag_id": "0",
            "language_id": "6",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_t3rSdx1gW8lPOdcb.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3832",
            "hot_num": "681.8K",
            "rank_type": 1,
            "rank_order": 6,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1762333857_fyR4J5ZEAQ.jpg",
            "status": "2",
            "id": "3832",
            "tag_list_with_id": [
              {
                "id": "2420",
                "name": "Tarik-Ulur​",
                "base_id": "249",
                "sort": "0"
              },
              {
                "id": "1858",
                "name": "Cinta Diam",
                "base_id": "203",
                "sort": "1"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "2"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "3"
              },
              {
                "id": "2431",
                "name": "Elit Profesional​",
                "base_id": "250",
                "sort": "4"
              },
              {
                "id": "2442",
                "name": "Ma Xiaoyu",
                "base_id": "251",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "upload_num": "71",
            "introduce": "Di malam pernikahan, Vivian dan Bagus saling menipu demi gengsi. Wanita kuat dan dokter genit itu awalnya hanya menikah pura-pura, tapi dari kebohongan tumbuh cinta yang sungguh.\n",
            "title": "Pelukan landak",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1762333860_H5QQWZ8Qxn.jpg",
            "tag_name": [
              "Tarik-Ulur​",
              "Cinta Diam",
              "Nikah Dulu",
              "Keluarga Kaya",
              "Elit Profesional​",
              "Ma Xiaoyu",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_3AgX3mWwU7DocD5s.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "963",
            "hot_num": "573.7K",
            "rank_type": 1,
            "rank_order": 7,
            "recommend_config_id": "54",
            "slogan": "",
            "upload_num": "65",
            "app_tag_id": "0",
            "production_type": "3",
            "playlet_status": "1",
            "subscript": "1",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_35.jpg",
            "status": "2",
            "chapter_split_version": "0",
            "language_id": "6",
            "gender_type": "2",
            "introduce": "Pernikahan Jean dan Eron hanya status saja. Eron tetap setia pada cinta lamanya, Wina. Dia memaksa Jean punya anak dengan pria asing. Jean diam-diam menggunakan uang Eron untuk nafkahi Alex, seorang model di bar. Dari hubungan yang semula pura-pura, tumbuh cinta sejati dan Jean pun mengandung anak Alex.\nSetelah Eron tahu selama ini Wina hanya menipu dia, dia memohon untuk kembali dengan Jean. Tapi, dia terkejut ketika dia tahu Alex ternyata pewaris panglima perang paling berkuasa di Erova Timur.",
            "title": "Kejayaanku Setelah Berpisah",
            "has_collection": "0",
            "tag_name": [
              "​​Balas Dendam",
              "Manis",
              "​​Menikah Lagi​​",
              "Identitas Rahasia",
              "Keluarga Kaya",
              "Selingkuhan",
              "Zhao Jia",
              "Wang Daotie",
              "Romantis",
              "Perkotaan"
            ],
            "app_tag_name": "",
            "tag_list_with_id": [
              {
                "id": "2274",
                "name": "​​Balas Dendam",
                "base_id": "236",
                "sort": "0"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "1"
              },
              {
                "id": "2318",
                "name": "​​Menikah Lagi​​",
                "base_id": "240",
                "sort": "2"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "3"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "4"
              },
              {
                "id": "2070",
                "name": "Selingkuhan",
                "base_id": "182",
                "sort": "5"
              },
              {
                "id": "2585",
                "name": "Zhao Jia",
                "base_id": "264",
                "sort": "6"
              },
              {
                "id": "2453",
                "name": "Wang Daotie",
                "base_id": "252",
                "sort": "7"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "8"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "9"
              }
            ],
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1744078502_8QdYySGE6K.jpg",
            "id": "963",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_CDghH8MAbmbm3WRO.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4304",
            "hot_num": "514.9K",
            "rank_type": 1,
            "rank_order": 8,
            "playlet_status": "1",
            "title": "Putri Sah Membersihkan Keluarga",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1764582985_i8F4QBKBt4.jpg",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "app_tag_id": "0",
            "slogan": "",
            "has_collection": "0",
            "tag_name": [
              "Komedi Ringan​",
              "Putri Palsu",
              "Heroine",
              "Drama Kepuasan",
              "Keluarga",
              "Perkotaan"
            ],
            "id": "4304",
            "subscript": "0",
            "upload_num": "59",
            "tag_list_with_id": [
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "0"
              },
              {
                "id": "2343",
                "name": "Putri Palsu",
                "base_id": "242",
                "sort": "1"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "2"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "3"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "status": "2",
            "introduce": "Cempaka, gadis desa yang jago bela diri, dikembalikan ke keluarga kaya Keluarga Setyo. Namun, ia mendapati seluruh anggota keluarga serta sang putri angkat terus diteror oleh pengasuh rumah, Haira. Cempaka pun memutuskan untuk membersihkan rumah tangga ini dengan tangannya sendiri, dengan prinsip: \"\"Lebih memilih tindakan ketimbang kata-kata.\"\" Dimulailah misi perubahannya, dan di tengah pertarungannya, ia justru menemukan kehangatan dan rahasia tersembunyi yang menyatukan keluarganya.",
            "language_id": "6",
            "gender_type": "2",
            "production_type": "3",
            "cover_square": "",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843009_acpooUvKFd167lCI.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3985",
            "hot_num": "459.8K",
            "rank_type": 1,
            "rank_order": 9,
            "tag_name": [
              "Misteri",
              "Plot Twist​",
              "Kasih ibu",
              "Identitas Rahasia",
              "Perkotaan"
            ],
            "language_id": "6",
            "app_tag_id": "0",
            "title": "Makin Ditahan, Makin Penasaran",
            "subscript": "1",
            "production_type": "1",
            "upload_num": "40",
            "id": "3985",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "0",
            "slogan": "",
            "chapter_split_version": "0",
            "app_tag_name": "",
            "introduce": "Sejak kecil Adelia dilarang ibunya masuk ke “Taman Ular”. Saat dewasa, setiap kali bawa pacar pulang, mereka selalu putus dan menghilang. Adelia pun curiga dan nekat ungkap rahasia ibunya.",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "1528",
                "name": "Misteri",
                "base_id": "161",
                "sort": "0"
              },
              {
                "id": "2387",
                "name": "Plot Twist​",
                "base_id": "246",
                "sort": "1"
              },
              {
                "id": "2050",
                "name": "Kasih ibu",
                "base_id": "227",
                "sort": "2"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "3"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "4"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763027815_w3nriRSTQr.jpg",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1763028028_ZM58KjFMkS.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843009_09Dj6bUc8Ccu2oRR.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3764",
            "hot_num": "445.7K",
            "rank_type": 1,
            "rank_order": 10,
            "status": "2",
            "title": "Nyonya Muda yang Tidak Terkalahkan(Dubbing)",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "3764",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "2",
            "recommend_config_id": "0",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1761877812_pnXrepcYBT.jpg",
            "subscript": "1",
            "tag_list_with_id": [
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "0"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "1"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "2"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "3"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "4"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "5"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "tag_name": [
              "Nikah Dulu",
              "Komedi Ringan​",
              "Heroine",
              "Identitas Rahasia",
              "Drama Kepuasan",
              "Li Keyi",
              "Wang Peiyan",
              "Romantis",
              "Perkotaan"
            ],
            "introduce": "Shaka, putra nakal keluarga Lianto, terpaksa menikah dengan Kinar karena desakan kakeknya, disertai tiga perjanjian. Saat pernikahan, Kinar ingin menyelidiki kematian ibunya dan Shaka membantunya. Mereka pun bersatu untuk balas dendam hingga kebenaran terungkap dan cinta mereka bersemi.",
            "upload_num": "69",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1761877741_nDZnjXZjyt.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_LZQEBSqscnkqSKW5.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "1859",
            "hot_num": "431.1K",
            "rank_type": 1,
            "rank_order": 11,
            "status": "2",
            "title": "Sekata dalam Diam",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "1859",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "54",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1751446922_RiFZHX347e.jpg",
            "subscript": "1",
            "tag_list_with_id": [
              {
                "id": "1850",
                "name": "Penebusan",
                "base_id": "202",
                "sort": "0"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "1"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "2"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "2541",
                "name": "He Congrui",
                "base_id": "260",
                "sort": "5"
              },
              {
                "id": "2596",
                "name": "Liu Nian",
                "base_id": "265",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "tag_name": [
              "Penebusan",
              "Komedi Ringan​",
              "Nikah Dulu",
              "Manis",
              "CEO/ Miliarder",
              "He Congrui",
              "Liu Nian",
              "Romantis",
              "Perkotaan"
            ],
            "introduce": "Sasa tiba-tiba terjebak dalam plot novel yang dia baca, masuk ke tubuh Sasa Gita, tokoh pendukung yang angkuh dan membenci suaminya, Ferry yang bisu. Namun kini segalanya berubah. Sasa bersikap hangat, membantu Ferry pulih dari trauma, dan perlahan cinta pun tumbuh di antara mereka.",
            "upload_num": "92",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1751446917_hEZ4BtTE4y.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_Fm3w1NaICw60l1by.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3978",
            "hot_num": "410.6K",
            "rank_type": 1,
            "rank_order": 12,
            "tag_name": [
              "Adegan Dewasa​",
              "Tarik-Ulur​",
              "Langsung Cinta",
              "​​Menikah Lagi​​",
              "Identitas Rahasia",
              "Penguasa",
              "Romantis",
              "Asia Kuno"
            ],
            "language_id": "6",
            "app_tag_id": "0",
            "title": "Pria Simpanku Ternyata Kaisar",
            "subscript": "1",
            "production_type": "3",
            "upload_num": "80",
            "id": "3978",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "0",
            "slogan": "",
            "chapter_split_version": "0",
            "app_tag_name": "",
            "introduce": "Desi hidup menjanda dan membesarkan dua anak seorang diri. Saat ingin menikmati masa pensiun, ia malah menarik perhatian Kaisar Arif. Sang Kaisar tergoda oleh pesonanya dan bersumpah, wanita ini harus jadi miliknya.",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "2329",
                "name": "Adegan Dewasa​",
                "base_id": "241",
                "sort": "0"
              },
              {
                "id": "2420",
                "name": "Tarik-Ulur​",
                "base_id": "249",
                "sort": "1"
              },
              {
                "id": "1946",
                "name": "Langsung Cinta",
                "base_id": "214",
                "sort": "2"
              },
              {
                "id": "2318",
                "name": "​​Menikah Lagi​​",
                "base_id": "240",
                "sort": "3"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "4"
              },
              {
                "id": "2068",
                "name": "Penguasa",
                "base_id": "184",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1472",
                "name": "Asia Kuno",
                "base_id": "154",
                "sort": "7"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763028180_RGK6z5sAxD.jpg",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1763028183_EXCxb7XPHz.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_NNUsKBPVicQVsDRQ.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4009",
            "hot_num": "379.1K",
            "rank_type": 1,
            "rank_order": 13,
            "tag_name": [
              "Terlarang",
              "Jodoh",
              "CEO/ Miliarder",
              "Keluarga Kaya",
              "Romantis",
              "Perkotaan"
            ],
            "language_id": "6",
            "app_tag_id": "0",
            "title": "Godaan di Malam Hari",
            "subscript": "1",
            "production_type": "3",
            "upload_num": "87",
            "id": "4009",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "0",
            "slogan": "",
            "chapter_split_version": "0",
            "app_tag_name": "",
            "introduce": "Rini sadar dirinya cuma tokoh figuran dan memutuskan merebut hati Irfan, ayah angkat pacarnya sendiri. Cinta terlarang pun dimulai.",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "1778",
                "name": "Terlarang",
                "base_id": "193",
                "sort": "0"
              },
              {
                "id": "1786",
                "name": "Jodoh",
                "base_id": "194",
                "sort": "1"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "2"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "3"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763115589_2aX8MZ6jyM.jpg",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1763115591_6shPysjfRJ.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_x8VODzdJJNE3rMyp.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "978",
            "hot_num": "345.6K",
            "rank_type": 1,
            "rank_order": 14,
            "app_tag_name": "",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_41.jpg",
            "subscript": "5",
            "id": "978",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1744354754_jMjYb3nJZk.jpg",
            "recommend_config_id": "58",
            "slogan": "",
            "upload_num": "62",
            "app_tag_id": "0",
            "production_type": "2",
            "playlet_status": "1",
            "status": "2",
            "chapter_split_version": "0",
            "language_id": "6",
            "gender_type": "2",
            "introduce": "Demi terhindar dari pernikahan yang diatur oleh menantunya, Shinta Andra menikah dengan orang yang nggak dikenal. Shinta Andra menikah dengan Andi Liam yang merupakan direktur dari Grup Liam. Andi Liam menikah agar putrinya bisa pergi ke luar negeri dengan tenang. Setelah nikah, mereka berdua nggak pernah ketemu karena Shinta Andra mengalami kecelakaan. Saat mereka bertemu kembali, mereka nggak mengenal satu sama lain. Akhirnya, mereka berdua pun saling mencintai.",
            "title": "Cinta Di Ujung Senja（Dubbing）",
            "has_collection": "0",
            "tag_name": [
              "Salah Paham",
              "Balik alur",
              "Nikah Kilat",
              "Keluarga",
              "Romantis",
              "CEO/ Miliarder",
              "Paruh Baya",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1818",
                "name": "Salah Paham",
                "base_id": "198",
                "sort": "0"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "1"
              },
              {
                "id": "1746",
                "name": "Nikah Kilat",
                "base_id": "189",
                "sort": "2"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "3"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "4"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "5"
              },
              {
                "id": "1663",
                "name": "Paruh Baya",
                "base_id": "178",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_3VNTHBoMqCCjkbgq.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "2537",
            "hot_num": "322.7K",
            "rank_type": 1,
            "rank_order": 15,
            "playlet_status": "1",
            "introduce": "Nia yang baru bercerai melepas duka di klub malam dan tak sengaja bersama Kris. Keesokan harinya, mereka menikah. Tidak disangka, Kris adalah Wakil CEO di tempat Nia bekerja dan diam-diam telah mencintainya sejak lama.",
            "recommend_config_id": "54",
            "status": "2",
            "upload_num": "71",
            "cover_square": "",
            "subscript": "1",
            "id": "2537",
            "gender_type": "2",
            "app_tag_name": "",
            "title": "Nikah Kontrak Berujung Cinta",
            "app_tag_id": "0",
            "language_id": "6",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1755250892_TQAPmGr8Rz.jpg",
            "tag_list_with_id": [
              {
                "id": "1738",
                "name": "Cinta Semalam",
                "base_id": "188",
                "sort": "0"
              },
              {
                "id": "1818",
                "name": "Salah Paham",
                "base_id": "198",
                "sort": "1"
              },
              {
                "id": "2318",
                "name": "​​Menikah Lagi​​",
                "base_id": "240",
                "sort": "2"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "3"
              },
              {
                "id": "1858",
                "name": "Cinta Diam",
                "base_id": "203",
                "sort": "4"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "8"
              }
            ],
            "has_collection": "0",
            "production_type": "3",
            "chapter_split_version": "0",
            "tag_name": [
              "Cinta Semalam",
              "Salah Paham",
              "​​Menikah Lagi​​",
              "Manis",
              "Cinta Diam",
              "CEO/ Miliarder",
              "Romantis",
              "Perkotaan",
              "Deng Lingshu"
            ],
            "slogan": "",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_1APa7GXoF5byWHzI.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "2169",
            "hot_num": "301.3K",
            "rank_type": 1,
            "rank_order": 16,
            "playlet_status": "1",
            "introduce": "Nadia membawa putrinya yang menderita penyakit jantung ke rumah sakit, tak disangka dokter yang menangani adalah mantan pacarnya, sekaligus ayah dari putrinya. Tujuh tahun lalu mereka berpisah, kini Nadia sudah berganti nama dan penampilan. Bara Pratama tak mengenalinya, juga tak tahu ia melahirkan seorang putri untuknya. Pertemuan tak terduga, Nadia ingin menjauh, tapi takdir terus mempertemukan mereka,meski ia menyembunyikan jati dirinya, tapi hati Bara lebih dulu mengenalinya.",
            "recommend_config_id": "54",
            "status": "2",
            "upload_num": "79",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1753266469_ZYBRNYXJCc.jpg",
            "subscript": "1",
            "id": "2169",
            "gender_type": "2",
            "app_tag_name": "",
            "title": "Saat kita bertemu lagi",
            "app_tag_id": "0",
            "language_id": "6",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1753266422_bswBdYWEb2.jpg",
            "tag_list_with_id": [
              {
                "id": "2354",
                "name": "Hamil dan Kabur",
                "base_id": "243",
                "sort": "0"
              },
              {
                "id": "1818",
                "name": "Salah Paham",
                "base_id": "198",
                "sort": "1"
              },
              {
                "id": "1874",
                "name": "Reuni",
                "base_id": "205",
                "sort": "2"
              },
              {
                "id": "1607",
                "name": "Bayi Imut",
                "base_id": "171",
                "sort": "3"
              },
              {
                "id": "2431",
                "name": "Elit Profesional​",
                "base_id": "250",
                "sort": "4"
              },
              {
                "id": "2508",
                "name": "Zeng Hui",
                "base_id": "257",
                "sort": "5"
              },
              {
                "id": "2519",
                "name": "Han Yutong",
                "base_id": "258",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "has_collection": "0",
            "production_type": "3",
            "chapter_split_version": "0",
            "tag_name": [
              "Hamil dan Kabur",
              "Salah Paham",
              "Reuni",
              "Bayi Imut",
              "Elit Profesional​",
              "Zeng Hui",
              "Han Yutong",
              "Romantis",
              "Perkotaan"
            ],
            "slogan": "",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_J5Zp43gOhVG8U3w3.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3164",
            "hot_num": "278.8K",
            "rank_type": 1,
            "rank_order": 17,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1758275226_Z4X6x2N682.jpg",
            "status": "2",
            "id": "3164",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "1"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "2"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "3"
              },
              {
                "id": "1607",
                "name": "Bayi Imut",
                "base_id": "171",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "6"
              },
              {
                "id": "2519",
                "name": "Han Yutong",
                "base_id": "258",
                "sort": "7"
              }
            ],
            "upload_num": "86",
            "introduce": " Saat Sela terbangun di tengah jalan, seorang anak kecil mengaku sebagai anaknya, dan dia membawanya ke kantor polisi. Ternyata di sana dia mengetahui kalau dia sudah menikah dengan musuh bebuyutannya, dan memiliki selingkuhan yang membuat keluarganya bangkrut dan hancur. Sekarang dia ingin mengoreksi kesalahannya dan mengejar kembali suaminya, Joe Tanu dan kepercayaan anaknya, Jun Tanu.",
            "title": "Sayang, Aku Benaran Amnesia",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1758275230_n3ztARdWXR.jpg",
            "tag_name": [
              "Manis",
              "Komedi Ringan​",
              "Lintas Waktu",
              "CEO/ Miliarder",
              "Bayi Imut",
              "Romantis",
              "Perkotaan",
              "Han Yutong"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_5VSMbrtHaKxTiMOX.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "2984",
            "hot_num": "277.4K",
            "rank_type": 1,
            "rank_order": 18,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1757494565_tdStEcyhJh.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1757494569_fWG7xXTFan.jpg",
            "tag_list_with_id": [
              {
                "id": "1834",
                "name": "Reinkarnasi",
                "base_id": "200",
                "sort": "0"
              },
              {
                "id": "1906",
                "name": "Cinta Segitiga",
                "base_id": "209",
                "sort": "1"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "2"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "3"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "4"
              },
              {
                "id": "1496",
                "name": "Era Republik",
                "base_id": "157",
                "sort": "5"
              }
            ],
            "slogan": "",
            "title": "Mila Pembasmi Ilhitam",
            "upload_num": "42",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Reinkarnasi",
              "Cinta Segitiga",
              "Balik alur",
              "Heroine",
              "Dendam",
              "Era Republik"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "1",
            "introduce": "Setelah Terlahir Kembali, Mila Widyaningsih Menemukan Penderitaan Kehamilannya Telah Dipindahkan ke Dirinya oleh Mega Hidayanto melalui Ilhitam. Setelah Penyelidikan Tak Membuahkan Hasil, Ia Memanfaatkan Aromaterapi untuk Mendeteksi Racun Kemandulan dan Obat Peluntur yang Tersembunyi, Akhirnya Mengetahui Media Santet Itu. Diam-diam, Ia Membalikkan Kontrol atas Makanan dan Kehidupan Sehari-hari Mega Hidayanto, Membuatnya Perlahan Terguncang Mental. Pada Hari Persalinan, Mila Menyerang Balik dengan Secangkir Teh Empedu Es yang Mematikan, Membongkar Semua Kebenaran sebelum Pergi ke Selatan Membawa Maharnya.",
            "id": "2984",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_1tKaGwNysRbdHhSB.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "1445",
            "hot_num": "269.7K",
            "rank_type": 1,
            "rank_order": 19,
            "status": "2",
            "title": "Takdir Cinta dengan Kaisar(Dubbing)",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "1445",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "2",
            "recommend_config_id": "57",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_44.jpg",
            "subscript": "5",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "1"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "2"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "3"
              },
              {
                "id": "2068",
                "name": "Penguasa",
                "base_id": "184",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "2596",
                "name": "Liu Nian",
                "base_id": "265",
                "sort": "6"
              },
              {
                "id": "2541",
                "name": "He Congrui",
                "base_id": "260",
                "sort": "7"
              },
              {
                "id": "1472",
                "name": "Asia Kuno",
                "base_id": "154",
                "sort": "8"
              }
            ],
            "tag_name": [
              "Manis",
              "Lintas Waktu",
              "Komedi Ringan​",
              "Balik alur",
              "Penguasa",
              "Romantis",
              "Liu Nian",
              "He Congrui",
              "Asia Kuno"
            ],
            "introduce": "Yeji Sora, seorang pekerja humas modern, meninggal karena kelelahan dan bereinkarnasi menjadi putri perdana menteri. Awalnya hanya ingin bercerai dan hidup santai, tetapi malah terikat takdir hidup dan mati dengan kaisar, Fendi Jone. Yeji menarik perhatian Fendi dengan kecerdasannya, dan Fendi melindunginya dengan kekuatannya. Perasaan mereka tumbuh seiring waktu. Pada akhirnya, Yeji berhasil bercerai dan bersama Fendi menyelesaikan takdir hidup dan mati mereka.",
            "upload_num": "62",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1748398967_GPFBeT8hXB.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_zEgi6ggioHm5INrY.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "1525",
            "hot_num": "262.0K",
            "rank_type": 1,
            "rank_order": 20,
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_50.jpg",
            "gender_type": "2",
            "introduce": "Pada tahun 1955, Profesor Rossa meninggal dunia secara tak terduga. Setelah membuka mata, dia justru terbangun di tubuh seorang gadis SMA berusia delapan belas tahun yang memiliki nama dan marga yang sama, tujuh puluh tahun kemudian. Kini, putranya telah menjadi seorang ketua direksi berusia lebih dari tujuh puluh tahun, dan dia bahkan memiliki beberapa cicit laki-laki yang tampan. Dalam proses menyesuaikan diri dengan kehidupan barunya, Profesor Rossa mulai menertibkan para cicitnya yang nakal dan tidak berbakti dengan kecerdasan dan kemampuannya. Di era yang benar-benar baru ini, ia pun menemukan keindahan hidupnya sendiri!",
            "id": "1525",
            "app_tag_name": "",
            "subscript": "1",
            "app_tag_id": "0",
            "recommend_config_id": "69",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1749034152_x7YDz67FXT.jpg",
            "tag_name": [
              "Heroine",
              "Drama Kepuasan",
              "Keluarga Kaya",
              "Alpha",
              "Lintas Waktu",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "0"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "1"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "2"
              },
              {
                "id": "1794",
                "name": "Alpha",
                "base_id": "195",
                "sort": "3"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "title": "Nenek Muda: Kebangkitan Keluarga",
            "language_id": "6",
            "has_collection": "0",
            "production_type": "3",
            "status": "2",
            "playlet_status": "1",
            "upload_num": "47",
            "slogan": "",
            "chapter_split_version": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_g84hLItGr9Nj8POX.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          }
        ]
      },
      {
        "name": "Serial Baru",
        "rank_type": 2,
        "data": [
          {
            "playlet_id": "4464",
            "hot_num": "1.6M",
            "rank_type": 2,
            "rank_order": 1,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765360492_J8FZPp2JnN.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765360496_HYNS6c7YJp.jpg",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "1842",
                "name": "Beda Usia",
                "base_id": "201",
                "sort": "1"
              },
              {
                "id": "1850",
                "name": "Penebusan",
                "base_id": "202",
                "sort": "2"
              },
              {
                "id": "1970",
                "name": "Karier",
                "base_id": "217",
                "sort": "3"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "4"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "5"
              },
              {
                "id": "2552",
                "name": "Zhao Tingyi",
                "base_id": "261",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "slogan": "",
            "title": "Masa Bersinarku",
            "upload_num": "81",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Manis",
              "Beda Usia",
              "Penebusan",
              "Karier",
              "Kesadaran Perempuan​",
              "CEO/ Miliarder",
              "Zhao Tingyi",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "2",
            "introduce": "Pada hari Mia Wijaya resmi jadi karyawan tetap, dia tiba-tiba dipecat dan bertemu Eko Utomo secara tak terduga, mengubah jalannya hidupnya. Berkat rekomendasi Eko, Mia berhasil mendapat kesempatan di perusahaan konsultan top Maxwell. Dengan ketangguhan luar biasa, dia berhasil bertahan dan berkembang, dari seorang pemula menjadi analis bisnis yang mandiri. Di tengah persaingan di kantor, Mia dan Eko saling menyukai dan akhirnya bersama. Menyadari bahwa di balik penampilan sempurna Eko, dia takut jatuh cinta dan tak bisa mengekspresikan perasaannya, Mia dengan kesabaran dan optimisme membimbingnya perlahan-lahan, membuka hatinya yang tertutup. Eko mulai mencoba melepaskan lapisan dingin itu, belajar untuk rileks, menerima ketidaksempurnaan dirinya, dan belajar mengekspresikan cinta.\n",
            "id": "4464",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_Nz3DhH5jtKHBXOoH.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4784",
            "hot_num": "488.8K",
            "rank_type": 2,
            "rank_order": 2,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766741407_EM5Chj357Q.jpg",
            "status": "2",
            "id": "4784",
            "tag_list_with_id": [
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "0"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "1"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "2"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "3"
              },
              {
                "id": "1679",
                "name": "Dewa Perang",
                "base_id": "180",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "1472",
                "name": "Asia Kuno",
                "base_id": "154",
                "sort": "6"
              }
            ],
            "upload_num": "77",
            "introduce": "Fitri terlahir kembali pada hari pernikahan, memutuskan untuk menikah dengan Wahyu, orang kaya yang merebutnya di kehidupan sebelumnya, dan memulai jalan mendidik suaminya.\n\n",
            "title": "Menaklukkan Suami Nakal",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1766741410_Qayb74iZQi.jpg",
            "tag_name": [
              "Komedi Ringan​",
              "Nikah Dulu",
              "Wang Peiyan",
              "Li Keyi",
              "Dewa Perang",
              "Romantis",
              "Asia Kuno"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "2",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_oXyiMlKQrlgqE05J.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4653",
            "hot_num": "102.7K",
            "rank_type": 2,
            "rank_order": 3,
            "status": "2",
            "title": "Panglima Begitu Menawan",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "4653",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "0",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1766134850_kJQQGKaa4Z.jpg",
            "subscript": "0",
            "tag_list_with_id": [
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "0"
              },
              {
                "id": "1874",
                "name": "Reuni",
                "base_id": "205",
                "sort": "1"
              },
              {
                "id": "1986",
                "name": "Dua tokoh kuat",
                "base_id": "219",
                "sort": "2"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "3"
              },
              {
                "id": "2508",
                "name": "Zeng Hui",
                "base_id": "257",
                "sort": "4"
              },
              {
                "id": "2519",
                "name": "Han Yutong",
                "base_id": "258",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1496",
                "name": "Era Republik",
                "base_id": "157",
                "sort": "7"
              }
            ],
            "tag_name": [
              "Komedi Ringan​",
              "Reuni",
              "Dua tokoh kuat",
              "Heroine",
              "Zeng Hui",
              "Han Yutong",
              "Romantis",
              "Era Republik"
            ],
            "introduce": "Pada awal era Republik, Jaya Guhara, putra perdana menteri, menikah di usia 10 tahun dengan Luvia Loekito yang seusia. Dalam didikan Luvia, Jaya pelan-pelan menaruh perasaan padanya.\nSetelah itu mereka berpisah. Saat bertemu lagi, Jaya sudah menjadi Panglima Daerah Bejara yang namanya disegani, sementara Luvia justru menjadi ketua musuh besar Pasukan Bejara, yaitu Geng Naga Biru.\nBegitu Jaya tahu identitas Luvia, hal pertama yang dia lakukan adalah datang sebagai mantan suami yang lagi jatuh, lalu masuk sebagai menantu cowok numpang dan minta pertanggungjawaban.",
            "upload_num": "75",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766134846_W2zb74DwK3.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_It74t3aiS8tTYsML.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4511",
            "hot_num": "92.7K",
            "rank_type": 2,
            "rank_order": 4,
            "status": "2",
            "id": "4511",
            "tag_list_with_id": [
              {
                "id": "1730",
                "name": "Hubungan Kontrak",
                "base_id": "187",
                "sort": "0"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "1"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "2"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "3"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "4"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "5"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "6"
              },
              {
                "id": "2070",
                "name": "Selingkuhan",
                "base_id": "182",
                "sort": "7"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "8"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "9"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "10"
              }
            ],
            "upload_num": "73",
            "introduce": "Yunta Cahya sadar kalau Joko Sidjaja, cowok dingin yang dia pelihara, diam-diam punya pacar.\nMaka Yunta langsung ambil keputusan, di pinggir jalan dia cari cowok lain buat jadi kekasih baru.\nCowok itu nggak cuma nurut dan pengertian, tapi juga profesional, sering bikin Yunta senang.\nTapi ternyata cowok manis dan pengertian itu adalah pewaris Grup Solihin, Yohan Solihin. Saat itu Yohan pakai nama Surya, kabur dari rumah demi mengejar impian di dunia hiburan.\nYunta sejak kecil melihat kakaknya disakiti pacarnya, jadi dia nggak ngerti cinta, takut jatuh cinta, cuma berani dekat dengan orang yang dia suka lewat cara peliharaan.\nDua orang yang masing-masing punya beban hati, setelah lama bersama akhirnya berani hadapi perasaan sendiri, nyelesain salah paham, dan hidup bahagia.",
            "title": "Romansa di Rumah Mewah",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765448226_pGeTCmMT7y.jpg",
            "tag_name": [
              "Hubungan Kontrak",
              "Manis",
              "Komedi Ringan​",
              "CEO/ Miliarder",
              "Keluarga Kaya",
              "Identitas Rahasia",
              "Heroine",
              "Selingkuhan",
              "Deng Lingshu",
              "Romantis",
              "Perkotaan"
            ],
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765448223_YRXr6zRcCW.jpg",
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "0",
            "slogan": "",
            "app_tag_name": "",
            "playlet_status": "1",
            "app_tag_id": "0",
            "gender_type": "2",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_Bwx1x22Dkx1NqotL.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4435",
            "hot_num": "81.7K",
            "rank_type": 2,
            "rank_order": 5,
            "playlet_status": "1",
            "title": "Balas Budi si Anak Durhaka",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765275055_rrHieeFW6T.jpg",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "app_tag_id": "0",
            "slogan": "",
            "has_collection": "0",
            "tag_name": [
              "Reinkarnasi",
              "Terbebas​",
              "Kesadaran Perempuan​",
              "Ibu Rumah Tangga",
              "Paruh Baya",
              "Keluarga",
              "Perkotaan"
            ],
            "id": "4435",
            "subscript": "0",
            "upload_num": "65",
            "tag_list_with_id": [
              {
                "id": "1834",
                "name": "Reinkarnasi",
                "base_id": "200",
                "sort": "0"
              },
              {
                "id": "2042",
                "name": "Terbebas​",
                "base_id": "226",
                "sort": "1"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "2"
              },
              {
                "id": "2069",
                "name": "Ibu Rumah Tangga",
                "base_id": "183",
                "sort": "3"
              },
              {
                "id": "1663",
                "name": "Paruh Baya",
                "base_id": "178",
                "sort": "4"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "5"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "6"
              }
            ],
            "status": "2",
            "introduce": "Diah dan suaminya membesarkan putra mereka, Ismail, dengan susah payah. Namun, mereka justru dieksploitasi oleh Ismail dan menantunya. Suami Diah meninggal dunia dengan penuh kekecewaan.\nSetelah terlahir kembali, Diah tersadar dan bangkit. Dia teguh mempertahankan prinsipnya dan melawan balik. Diah mengambil kembali hartanya, membongkar kebenaran kepada publik, dan akhirnya memutuskan hubungan dengan anak durhaka itu. Seluruh hartanya dia wakafkan untuk amal, mengajarkan makna sejati dari \"\"\"\"dari semua kebajikan, bakti kepada orang tua adalah yang utama",
            "language_id": "6",
            "gender_type": "2",
            "production_type": "3",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765275057_wXxNxR6HcJ.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_t3rSdx1gW8lPOdcb.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4710",
            "hot_num": "39.6K",
            "rank_type": 2,
            "rank_order": 6,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766482987_3MTpG5Dt5Q.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1766482990_4HQjZCQNTA.jpg",
            "tag_list_with_id": [
              {
                "id": "1962",
                "name": "Kekuatan Super",
                "base_id": "216",
                "sort": "0"
              },
              {
                "id": "2343",
                "name": "Putri Palsu",
                "base_id": "242",
                "sort": "1"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "2"
              },
              {
                "id": "2398",
                "name": "​​Alur Cerita Kreatif​",
                "base_id": "247",
                "sort": "3"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "4"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "5"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "6"
              },
              {
                "id": "1536",
                "name": "Sekolah",
                "base_id": "162",
                "sort": "7"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "8"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "9"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "10"
              }
            ],
            "slogan": "",
            "title": "Merebut Identitas Asliku",
            "upload_num": "58",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Kekuatan Super",
              "Putri Palsu",
              "Identitas Rahasia",
              "​​Alur Cerita Kreatif​",
              "Balik alur",
              "Keluarga Kaya",
              "Heroine",
              "Sekolah",
              "Dendam",
              "Drama Kepuasan",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "0",
            "introduce": "Citra dicuri identitasnya oleh Maya lewat sistem tukar kehidupan. Sepuluh tahun kemudian, ia kembali sebagai Sinta, membalas dendam, merebut kembali hidup dan keluarga. Kebaikan dan keadilan akhirnya menang.",
            "id": "4710",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_3AgX3mWwU7DocD5s.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4762",
            "hot_num": "33.1K",
            "rank_type": 2,
            "rank_order": 7,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766739396_JrStCZmE2T.jpg",
            "status": "2",
            "id": "4762",
            "tag_list_with_id": [
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "0"
              },
              {
                "id": "2058",
                "name": "Penipuan",
                "base_id": "228",
                "sort": "1"
              },
              {
                "id": "1754",
                "name": "Bangkit",
                "base_id": "190",
                "sort": "2"
              },
              {
                "id": "1623",
                "name": "Bad Boy",
                "base_id": "173",
                "sort": "3"
              },
              {
                "id": "2519",
                "name": "Han Yutong",
                "base_id": "258",
                "sort": "4"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "5"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "6"
              }
            ],
            "upload_num": "60",
            "introduce": "Yuli diperkosa lalu tewas oleh Budi. Adiknya, Rina, menyamar jadi sosialita demi balas dendam. Ia gagal jadi sekretaris tapi diterima jadi asisten. Budi jatuh cinta, akhirnya Rina ungkap kebenaran dan lapor polisi.",
            "title": "Siasat",
            "language_id": "6",
            "cover_square": "",
            "tag_name": [
              "Balik alur",
              "Penipuan",
              "Bangkit",
              "Bad Boy",
              "Han Yutong",
              "Dendam",
              "Perkotaan"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "0",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_CDghH8MAbmbm3WRO.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4565",
            "hot_num": "30.3K",
            "rank_type": 2,
            "rank_order": 8,
            "tag_name": [
              "Balik alur",
              "​​Alur Cerita Kreatif​",
              "Kekuatan Super",
              "Cinta Segitiga",
              "Idola",
              "Romantis",
              "Supranatural",
              "Perkotaan"
            ],
            "language_id": "6",
            "app_tag_id": "0",
            "title": "Istri Manis, Bayi Ajaib",
            "subscript": "0",
            "production_type": "3",
            "upload_num": "64",
            "id": "4565",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "0",
            "slogan": "",
            "chapter_split_version": "0",
            "app_tag_name": "",
            "introduce": "Lani yang hamil bisa dengar suara bayinya. Dia pura-pura manis, lahiran live buat bersihkan nama, lalu bawa si bayi cerdik sampai berhasil jadi nyonya Keluarga Saputra.\n",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "0"
              },
              {
                "id": "2398",
                "name": "​​Alur Cerita Kreatif​",
                "base_id": "247",
                "sort": "1"
              },
              {
                "id": "1962",
                "name": "Kekuatan Super",
                "base_id": "216",
                "sort": "2"
              },
              {
                "id": "1906",
                "name": "Cinta Segitiga",
                "base_id": "209",
                "sort": "3"
              },
              {
                "id": "1647",
                "name": "Idola",
                "base_id": "176",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "1520",
                "name": "Supranatural",
                "base_id": "160",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765791948_pcJfakyftY.jpg",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765791951_ThPFNsstDC.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843009_acpooUvKFd167lCI.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4463",
            "hot_num": "30.2K",
            "rank_type": 2,
            "rank_order": 9,
            "app_tag_name": "",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765362080_nNMxirWWHF.jpg",
            "subscript": "0",
            "id": "4463",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765362077_Ti4FPZ7ijs.jpg",
            "recommend_config_id": "0",
            "slogan": "",
            "upload_num": "70",
            "app_tag_id": "0",
            "production_type": "3",
            "playlet_status": "1",
            "status": "2",
            "chapter_split_version": "0",
            "language_id": "6",
            "gender_type": "2",
            "introduce": "Setelah bercerai, Rina bertemu Sony, pengusaha kaya yang tulus mengejarnya. Hubungan mereka ditolak anak-anak, namun sifat Rina membuat keluarga Sony menerima, juga menyentuh dua anaknya. Setelah banyak rintangan, mereka akhirnya bersama, membuktikan bahwa usia 50-an tetap bisa mengejar bahagia.\n",
            "title": "Cinta di Usia Senja",
            "has_collection": "0",
            "tag_name": [
              "Langsung Cinta",
              "​​Menikah Lagi​​",
              "CEO/ Miliarder",
              "Paruh Baya",
              "Romantis",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1946",
                "name": "Langsung Cinta",
                "base_id": "214",
                "sort": "0"
              },
              {
                "id": "2318",
                "name": "​​Menikah Lagi​​",
                "base_id": "240",
                "sort": "1"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "2"
              },
              {
                "id": "1663",
                "name": "Paruh Baya",
                "base_id": "178",
                "sort": "3"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843009_09Dj6bUc8Ccu2oRR.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4322",
            "hot_num": "29.9K",
            "rank_type": 2,
            "rank_order": 10,
            "playlet_status": "1",
            "title": "Dunia Berikan Dirimu",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1764668870_p5xZR5ytCW.jpg",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "app_tag_id": "0",
            "slogan": "",
            "has_collection": "0",
            "tag_name": [
              "Romantis",
              "Dendam",
              "Nikah Dulu",
              "Penebusan",
              "Cinta segi banyak",
              "Pengkhianatan",
              "CEO/ Miliarder",
              "Perkotaan"
            ],
            "id": "4322",
            "subscript": "1",
            "upload_num": "64",
            "tag_list_with_id": [
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "0"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "1"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "2"
              },
              {
                "id": "1850",
                "name": "Penebusan",
                "base_id": "202",
                "sort": "3"
              },
              {
                "id": "2026",
                "name": "Cinta segi banyak",
                "base_id": "224",
                "sort": "4"
              },
              {
                "id": "1810",
                "name": "Pengkhianatan",
                "base_id": "197",
                "sort": "5"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "status": "2",
            "introduce": "Intan yang dulu diboikot industri sudah berkorban semua demi pacarnya, namun menjelang menikah malah memergoki dia selingkuh dengan sahabatnya. Setelah sadar ditipu, Intan menikah kilat dengan Presdir Hario Dedi dan bertekad merebut kembali semuanya.",
            "language_id": "6",
            "gender_type": "2",
            "production_type": "3",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1764668874_sTPFQz7YKt.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_LZQEBSqscnkqSKW5.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4721",
            "hot_num": "29.8K",
            "rank_type": 2,
            "rank_order": 11,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766566583_ZyMw4SiJ55.jpg",
            "status": "2",
            "cover_square": "",
            "tag_list_with_id": [
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "0"
              },
              {
                "id": "1754",
                "name": "Bangkit",
                "base_id": "190",
                "sort": "1"
              },
              {
                "id": "1810",
                "name": "Pengkhianatan",
                "base_id": "197",
                "sort": "2"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "3"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "slogan": "",
            "title": "Takdir Yang Tercuri",
            "upload_num": "58",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Balik alur",
              "Bangkit",
              "Pengkhianatan",
              "Heroine",
              "Dendam",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "0",
            "introduce": "​​Yuli, satu-satunya mahasiswa yang diterima universitas dari desanya, justru dikhianati sahabatnya sendiri, Yulia. Yulia mencuri surat penerimaannya, bahkan secara tak langsung menyebabkan kematian ayah Yuli. Sepuluh tahun kemudian, mereka bertemu kembali dengan status yang bagai langit dan bumi. Yuli yakin bahwa takdirnya tak bisa dicuri orang lain. Dia membongkar kebenaran setahap demi setahap, bangkit dari akar rumput menjadi seorang pengusaha sukses, dan akhirnya menjadi pemenang dalam hidupnya.​",
            "id": "4721",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_Fm3w1NaICw60l1by.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4750",
            "hot_num": "28.9K",
            "rank_type": 2,
            "rank_order": 12,
            "status": "2",
            "title": "Cinta Kedua, Janji Sejati",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "4750",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "0",
            "cover_square": "",
            "subscript": "0",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "1"
              },
              {
                "id": "1607",
                "name": "Bayi Imut",
                "base_id": "171",
                "sort": "2"
              },
              {
                "id": "1671",
                "name": "Cinderella",
                "base_id": "179",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "6"
              }
            ],
            "tag_name": [
              "Manis",
              "Nikah Dulu",
              "Bayi Imut",
              "Cinderella",
              "CEO/ Miliarder",
              "Romantis",
              "Perkotaan"
            ],
            "introduce": "Ibu tunggal Nisa salah kira Ardi saat kencan, lalu nikah kilat. Lewat salah paham dan ujian, dengan bantuan putrinya mereka rujuk, rahasia anak terungkap, akhirnya bersama.",
            "upload_num": "79",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766654395_FG6kx8F3pR.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_NNUsKBPVicQVsDRQ.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4694",
            "hot_num": "28.3K",
            "rank_type": 2,
            "rank_order": 13,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766395710_Me8Xbn8PPB.jpg",
            "status": "2",
            "id": "4694",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "1874",
                "name": "Reuni",
                "base_id": "205",
                "sort": "1"
              },
              {
                "id": "1986",
                "name": "Dua tokoh kuat",
                "base_id": "219",
                "sort": "2"
              },
              {
                "id": "1607",
                "name": "Bayi Imut",
                "base_id": "171",
                "sort": "3"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "4"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1472",
                "name": "Asia Kuno",
                "base_id": "154",
                "sort": "7"
              }
            ],
            "upload_num": "80",
            "introduce": "Mia Mukti terlempar ke masa lalu dan menghabiskan satu malam bersama Ismail Nurjannah, Pangeran Mahkota Kerajaan Selatan. Enam tahun kemudian, Mia membawa anak mereka ke ibu kota, namun terus dihina oleh Putri Mahkota Yuni Maharani. Ismail tampil membela Mia dan meminta maaf dari Yuni. Keduanya pun semakin dekat dan baru menyadari bahwa mereka telah saling mencintai sejak malam itu. Ismail juga terkejut menemukan bahwa anak yang selama ini dicarinya ke seantero kota ternyata ada di dekatnya, dan Mia adalah putri kandung yang sah dari almarhum raja.",
            "title": "Istriku Adalah Ahli Obat",
            "language_id": "6",
            "cover_square": "",
            "tag_name": [
              "Manis",
              "Reuni",
              "Dua tokoh kuat",
              "Bayi Imut",
              "Balik alur",
              "Identitas Rahasia",
              "Romantis",
              "Asia Kuno"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "0",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_x8VODzdJJNE3rMyp.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4465",
            "hot_num": "20.8K",
            "rank_type": 2,
            "rank_order": 14,
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765360813_6CnfJXeXFx.jpg",
            "gender_type": "2",
            "introduce": "Utami bermimpi suaminya, Irfan, bakal jatuh cinta pada selingkuhan, memberinya perhiasan mahal dan barang mewah, serta selalu membela perempuan itu. Sementara Utami sendiri terdesak sampai ke titik terakhir dan akhirnya tewas tragis di rumah sakit jiwa. Setelah terbangun, ia langsung menampar Irfan.\n",
            "id": "4465",
            "app_tag_name": "",
            "subscript": "0",
            "app_tag_id": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765360786_K3sQCmbWMW.jpg",
            "tag_name": [
              "Manis",
              "Tarik-Ulur​",
              "CEO/ Miliarder",
              "Romantis",
              "Lintas Waktu",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "2420",
                "name": "Tarik-Ulur​",
                "base_id": "249",
                "sort": "1"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "2"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "3"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "title": "Suamiku, Si Penempel Manja",
            "language_id": "6",
            "has_collection": "0",
            "production_type": "3",
            "status": "2",
            "playlet_status": "1",
            "upload_num": "98",
            "slogan": "",
            "chapter_split_version": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_3VNTHBoMqCCjkbgq.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4440",
            "hot_num": "20.6K",
            "rank_type": 2,
            "rank_order": 15,
            "tag_name": [
              "Heroine",
              "Kultivasi Abadi",
              "Balik alur",
              "​​Balas Dendam",
              "Lintas Waktu",
              "Li Keyi",
              "Drama Kepuasan",
              "Asia Kuno"
            ],
            "language_id": "6",
            "app_tag_id": "0",
            "title": "Legenda Keluarga Japhar",
            "subscript": "0",
            "production_type": "3",
            "upload_num": "69",
            "id": "4440",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "0",
            "slogan": "",
            "chapter_split_version": "0",
            "app_tag_name": "",
            "introduce": "Yuri Japhar, seorang dewa yang sedang melewati cobaan kenaikan derajat, tiba-tiba bereinkarnasi menjadi Yeri Japhar, cicit keenam Keluarga Japhar yang meninggal muda di usia delapan belas. Kembali ke Keluarga Japhar, Yuri melihat keluarga semakin melemah, keturunan tak berguna, dan Pak Tua yang sudah tua serta diracun, tak bisa mengurus urusan keluarga. Dia memutuskan tetap tinggal di dunia fana, membangkitkan kembali keluarga.\n",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "0"
              },
              {
                "id": "1954",
                "name": "Kultivasi Abadi",
                "base_id": "215",
                "sort": "1"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "2"
              },
              {
                "id": "2274",
                "name": "​​Balas Dendam",
                "base_id": "236",
                "sort": "3"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "4"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "5"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "6"
              },
              {
                "id": "1472",
                "name": "Asia Kuno",
                "base_id": "154",
                "sort": "7"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765275314_mTQreF2ysp.jpg",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765275318_pStQJSa8mK.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_1APa7GXoF5byWHzI.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4720",
            "hot_num": "20.3K",
            "rank_type": 2,
            "rank_order": 16,
            "cover_square": "",
            "gender_type": "2",
            "introduce": "Ayu Wibisono, putri satu-satunya keluarga kaya, menikah dengan Dimas Oktaviani yang miskin dan hamil. Saat melahirkan, orang tuanya tewas dalam kecelakaan mobil. Ayu selamat, tetapi janinnya keguguran dan ia menjadi cacat mental. Tiga tahun kemudian, ia sadar secara tiba-tiba dan menemukan kenyataan pahit: suami dan sahabatnya telah berkhianat, bahkan meracuni hingga ia cacat! Kecelakaan tiga tahun lalu juga ternyata direncanakan. Ayu pun merencanakan balas dendam.",
            "id": "4720",
            "app_tag_name": "",
            "subscript": "0",
            "app_tag_id": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766566610_YRdRQrNikE.jpg",
            "tag_name": [
              "Bangkit",
              "Pengkhianatan",
              "Reinkarnasi",
              "Heroine",
              "Dendam",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1754",
                "name": "Bangkit",
                "base_id": "190",
                "sort": "0"
              },
              {
                "id": "1810",
                "name": "Pengkhianatan",
                "base_id": "197",
                "sort": "1"
              },
              {
                "id": "1834",
                "name": "Reinkarnasi",
                "base_id": "200",
                "sort": "2"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "3"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "title": "Sebelum Fajar​",
            "language_id": "6",
            "has_collection": "0",
            "production_type": "3",
            "status": "2",
            "playlet_status": "1",
            "upload_num": "52",
            "slogan": "",
            "chapter_split_version": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_J5Zp43gOhVG8U3w3.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4419",
            "hot_num": "16.6K",
            "rank_type": 2,
            "rank_order": 17,
            "status": "2",
            "title": "Si Naga Sembilan Kembali",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "4419",
            "slogan": "",
            "gender_type": "1",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "0",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765188889_BRDwwiBpWs.jpg",
            "subscript": "0",
            "tag_list_with_id": [
              {
                "id": "1898",
                "name": "Terpisah Keluarga",
                "base_id": "208",
                "sort": "0"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "1"
              },
              {
                "id": "1615",
                "name": "Mafia",
                "base_id": "172",
                "sort": "2"
              },
              {
                "id": "1754",
                "name": "Bangkit",
                "base_id": "190",
                "sort": "3"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "tag_name": [
              "Terpisah Keluarga",
              "Identitas Rahasia",
              "Mafia",
              "Bangkit",
              "Keluarga",
              "Perkotaan"
            ],
            "introduce": "Lima belas tahun silam, demi melindungi saudara seperjuangannya, Sony Wijaya bertarung sendirian hanya dengan sebilah pedang melawan sindikat bairawah tanah Kota Jira, hingga menjelma menjadi legenda dunia bawah tanah. Kini, usai bebas dari penjara, istri dan anaknya dihina oleh penjahat. Kembalinya sang raja membuat dunia bawah tanah kembali gemetar!",
            "upload_num": "53",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765188878_4nBR2ZrmTE.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_5VSMbrtHaKxTiMOX.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4785",
            "hot_num": "13.6K",
            "rank_type": 2,
            "rank_order": 18,
            "playlet_status": "1",
            "title": "Suara Hati di Balik Rahasia",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766744679_HNAkTQw2eK.jpg",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "app_tag_id": "0",
            "slogan": "",
            "has_collection": "0",
            "tag_name": [],
            "id": "4785",
            "subscript": "2",
            "upload_num": "55",
            "tag_list_with_id": [],
            "status": "2",
            "introduce": "Sofia Salim, calon siswa ujian masuk perguruan tinggi, hidup lagi setelah jatuh dari atap karena difitnah plagiat oleh Siska Kurnia. Dia menemukan Siska bisa mendengar suara hati, lalu menggunakan sistem ubah suara hati untuk balas dendam. Dengan sistem dan kecerdasannya, Sofia perlahan mengungkap sisi asli Siska, akhirnya diterima di universitas, diundang ke jamuan malam Grup Surya, dan mendapatkan cinta sejati.",
            "language_id": "6",
            "gender_type": "2",
            "production_type": "3",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1766744682_amCb2JZxim.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_1tKaGwNysRbdHhSB.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4693",
            "hot_num": "12.5K",
            "rank_type": 2,
            "rank_order": 19,
            "status": "2",
            "title": "Putri Pembalas",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "4693",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "0",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1766394298_Y3K3CxFmJz.jpg",
            "subscript": "0",
            "tag_list_with_id": [
              {
                "id": "1818",
                "name": "Salah Paham",
                "base_id": "198",
                "sort": "0"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "1"
              },
              {
                "id": "2387",
                "name": "Plot Twist​",
                "base_id": "246",
                "sort": "2"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "3"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "tag_name": [
              "Salah Paham",
              "Balik alur",
              "Plot Twist​",
              "Keluarga Kaya",
              "Drama Kepuasan",
              "Perkotaan"
            ],
            "introduce": "Lestari menghadiri reuni keluarga, disangka selingkuhan oleh pacar ayahnya, Tri, dan dihina. Setelah itu ia bekerja sembunyi, mengumpulkan bukti korupsi, dan menjerat Tri.",
            "upload_num": "75",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766394296_cspFG3M4En.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_zEgi6ggioHm5INrY.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4707",
            "hot_num": "10.3K",
            "rank_type": 2,
            "rank_order": 20,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766480632_4J4fSAbkPP.jpg",
            "status": "2",
            "cover_square": "",
            "tag_list_with_id": [
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "0"
              },
              {
                "id": "1754",
                "name": "Bangkit",
                "base_id": "190",
                "sort": "1"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "2"
              },
              {
                "id": "1560",
                "name": "Dendam",
                "base_id": "165",
                "sort": "3"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "4"
              }
            ],
            "slogan": "",
            "title": "Takdir yang Diganti",
            "upload_num": "68",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Balik alur",
              "Bangkit",
              "Keluarga Kaya",
              "Dendam",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "0",
            "introduce": "Dua puluh tahun lalu, bayi keluarga Liem diganti dan dibuang, diselamatkan oleh Tia. Kini, Lani masuk Grup Liem namun difitnah dan disiksa oleh Weni, anak pengganti itu.",
            "id": "4707",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_g84hLItGr9Nj8POX.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          }
        ]
      },
      {
        "name": "Trending",
        "rank_type": 3,
        "data": [
          {
            "playlet_id": "487",
            "hot_num": "1.3M",
            "rank_type": 3,
            "rank_order": 1,
            "cover_square": "",
            "gender_type": "2",
            "introduce": "Lily Benneth ke kota untuk mengunjungi adiknya, Nana, namun mendapati Nana hidup mewah dengan berpura-pura sebagai dirinya.\nSementara itu, Lily bekerja di restoran Grup Vuton, menghadapi tekanan dari Eldrik. Namun, dia menarik perhatian sang CEO, Vale Vuton. Kebenaran akhirnya terungkap oleh ibu angkatnya, Nana menerima konsekuensinya, dan Lily berakhir bahagia bersama Vale.",
            "id": "487",
            "app_tag_name": "",
            "subscript": "0",
            "app_tag_id": "0",
            "recommend_config_id": "54",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739501785_zsaF7GGDbb.jpg",
            "tag_name": [
              "Putri Palsu",
              "Pengkhianatan",
              "Kesadaran Perempuan​",
              "CEO/ Miliarder",
              "Cinderella",
              "Deng Lingshu",
              "Zeng Hui",
              "Romantis",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "2343",
                "name": "Putri Palsu",
                "base_id": "242",
                "sort": "0"
              },
              {
                "id": "1810",
                "name": "Pengkhianatan",
                "base_id": "197",
                "sort": "1"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "2"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "3"
              },
              {
                "id": "1671",
                "name": "Cinderella",
                "base_id": "179",
                "sort": "4"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "5"
              },
              {
                "id": "2508",
                "name": "Zeng Hui",
                "base_id": "257",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "title": "Cintaku Hadir Di Kehidupan Selanjutnya",
            "language_id": "6",
            "has_collection": "0",
            "production_type": "3",
            "status": "2",
            "playlet_status": "1",
            "upload_num": "77",
            "slogan": "",
            "chapter_split_version": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_Nz3DhH5jtKHBXOoH.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4464",
            "hot_num": "966.5K",
            "rank_type": 3,
            "rank_order": 2,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765360492_J8FZPp2JnN.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765360496_HYNS6c7YJp.jpg",
            "tag_list_with_id": [
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "0"
              },
              {
                "id": "1842",
                "name": "Beda Usia",
                "base_id": "201",
                "sort": "1"
              },
              {
                "id": "1850",
                "name": "Penebusan",
                "base_id": "202",
                "sort": "2"
              },
              {
                "id": "1970",
                "name": "Karier",
                "base_id": "217",
                "sort": "3"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "4"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "5"
              },
              {
                "id": "2552",
                "name": "Zhao Tingyi",
                "base_id": "261",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "slogan": "",
            "title": "Masa Bersinarku",
            "upload_num": "81",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Manis",
              "Beda Usia",
              "Penebusan",
              "Karier",
              "Kesadaran Perempuan​",
              "CEO/ Miliarder",
              "Zhao Tingyi",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "2",
            "introduce": "Pada hari Mia Wijaya resmi jadi karyawan tetap, dia tiba-tiba dipecat dan bertemu Eko Utomo secara tak terduga, mengubah jalannya hidupnya. Berkat rekomendasi Eko, Mia berhasil mendapat kesempatan di perusahaan konsultan top Maxwell. Dengan ketangguhan luar biasa, dia berhasil bertahan dan berkembang, dari seorang pemula menjadi analis bisnis yang mandiri. Di tengah persaingan di kantor, Mia dan Eko saling menyukai dan akhirnya bersama. Menyadari bahwa di balik penampilan sempurna Eko, dia takut jatuh cinta dan tak bisa mengekspresikan perasaannya, Mia dengan kesabaran dan optimisme membimbingnya perlahan-lahan, membuka hatinya yang tertutup. Eko mulai mencoba melepaskan lapisan dingin itu, belajar untuk rileks, menerima ketidaksempurnaan dirinya, dan belajar mengekspresikan cinta.\n",
            "id": "4464",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_oXyiMlKQrlgqE05J.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4784",
            "hot_num": "706.7K",
            "rank_type": 3,
            "rank_order": 3,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1766741407_EM5Chj357Q.jpg",
            "status": "2",
            "id": "4784",
            "tag_list_with_id": [
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "0"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "1"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "2"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "3"
              },
              {
                "id": "1679",
                "name": "Dewa Perang",
                "base_id": "180",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "1472",
                "name": "Asia Kuno",
                "base_id": "154",
                "sort": "6"
              }
            ],
            "upload_num": "77",
            "introduce": "Fitri terlahir kembali pada hari pernikahan, memutuskan untuk menikah dengan Wahyu, orang kaya yang merebutnya di kehidupan sebelumnya, dan memulai jalan mendidik suaminya.\n\n",
            "title": "Menaklukkan Suami Nakal",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1766741410_Qayb74iZQi.jpg",
            "tag_name": [
              "Komedi Ringan​",
              "Nikah Dulu",
              "Wang Peiyan",
              "Li Keyi",
              "Dewa Perang",
              "Romantis",
              "Asia Kuno"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "2",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_It74t3aiS8tTYsML.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "1859",
            "hot_num": "664.6K",
            "rank_type": 3,
            "rank_order": 4,
            "status": "2",
            "title": "Sekata dalam Diam",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "1859",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "54",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1751446922_RiFZHX347e.jpg",
            "subscript": "1",
            "tag_list_with_id": [
              {
                "id": "1850",
                "name": "Penebusan",
                "base_id": "202",
                "sort": "0"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "1"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "2"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "2541",
                "name": "He Congrui",
                "base_id": "260",
                "sort": "5"
              },
              {
                "id": "2596",
                "name": "Liu Nian",
                "base_id": "265",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "tag_name": [
              "Penebusan",
              "Komedi Ringan​",
              "Nikah Dulu",
              "Manis",
              "CEO/ Miliarder",
              "He Congrui",
              "Liu Nian",
              "Romantis",
              "Perkotaan"
            ],
            "introduce": "Sasa tiba-tiba terjebak dalam plot novel yang dia baca, masuk ke tubuh Sasa Gita, tokoh pendukung yang angkuh dan membenci suaminya, Ferry yang bisu. Namun kini segalanya berubah. Sasa bersikap hangat, membantu Ferry pulih dari trauma, dan perlahan cinta pun tumbuh di antara mereka.",
            "upload_num": "92",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1751446917_hEZ4BtTE4y.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_Bwx1x22Dkx1NqotL.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "2518",
            "hot_num": "577.1K",
            "rank_type": 3,
            "rank_order": 5,
            "status": "2",
            "title": "Nyonya Muda yang Tidak Terkalahkan",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "2518",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "69",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1755166070_MF35TZiH85.jpg",
            "subscript": "1",
            "tag_list_with_id": [
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "0"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "1"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "2"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "3"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "4"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "5"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "6"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "7"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "8"
              }
            ],
            "tag_name": [
              "Nikah Dulu",
              "Komedi Ringan​",
              "Heroine",
              "Identitas Rahasia",
              "Drama Kepuasan",
              "Li Keyi",
              "Wang Peiyan",
              "Romantis",
              "Perkotaan"
            ],
            "introduce": "Shaka, putra nakal keluarga Lianto, terpaksa menikah dengan Kinar karena desakan kakeknya, disertai tiga perjanjian. Saat pernikahan, Kinar ingin menyelidiki kematian ibunya dan Shaka membantunya. Mereka pun bersatu untuk balas dendam hingga kebenaran terungkap dan cinta mereka bersemi.",
            "upload_num": "69",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1755166058_trYHystbHh.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_t3rSdx1gW8lPOdcb.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3832",
            "hot_num": "468.3K",
            "rank_type": 3,
            "rank_order": 6,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1762333857_fyR4J5ZEAQ.jpg",
            "status": "2",
            "id": "3832",
            "tag_list_with_id": [
              {
                "id": "2420",
                "name": "Tarik-Ulur​",
                "base_id": "249",
                "sort": "0"
              },
              {
                "id": "1858",
                "name": "Cinta Diam",
                "base_id": "203",
                "sort": "1"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "2"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "3"
              },
              {
                "id": "2431",
                "name": "Elit Profesional​",
                "base_id": "250",
                "sort": "4"
              },
              {
                "id": "2442",
                "name": "Ma Xiaoyu",
                "base_id": "251",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "upload_num": "71",
            "introduce": "Di malam pernikahan, Vivian dan Bagus saling menipu demi gengsi. Wanita kuat dan dokter genit itu awalnya hanya menikah pura-pura, tapi dari kebohongan tumbuh cinta yang sungguh.\n",
            "title": "Pelukan landak",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1762333860_H5QQWZ8Qxn.jpg",
            "tag_name": [
              "Tarik-Ulur​",
              "Cinta Diam",
              "Nikah Dulu",
              "Keluarga Kaya",
              "Elit Profesional​",
              "Ma Xiaoyu",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_3AgX3mWwU7DocD5s.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3448",
            "hot_num": "442.7K",
            "rank_type": 3,
            "rank_order": 7,
            "app_tag_name": "",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1760152288_PxNnhWB8Wj.jpg",
            "subscript": "1",
            "id": "3448",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1760152256_3WT7YMEDkF.jpg",
            "recommend_config_id": "0",
            "slogan": "",
            "upload_num": "63",
            "app_tag_id": "0",
            "production_type": "3",
            "playlet_status": "1",
            "status": "2",
            "chapter_split_version": "0",
            "language_id": "6",
            "gender_type": "2",
            "introduce": "Setelah cerai dari suaminya yang berengsek, Sena Yanti menjadi penyiar siaran langsung yang sukses besar! Selain mendapat uang dari komisi siaran langsung, dia juga berniat mengambil sogokan dari para wanita yang menginginkan pacarnya yang ganteng, Tino Holan, seorang mafia di Kota Galang. Melihat kesuksesan Sena, mantan suaminya, Joko berusaha mencari cara untuk merebutnya kembali. Namun, tentu saja cara piciknya tidak sebanding dengan cara kerja bos mafia.",
            "title": "Sasaran Utamaku",
            "has_collection": "0",
            "tag_name": [
              "Romantis",
              "Kesadaran Perempuan​",
              "​​Menikah Lagi​​",
              "Ibu Rumah Tangga",
              "Zhao Jia",
              "CEO/ Miliarder",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "0"
              },
              {
                "id": "2252",
                "name": "Kesadaran Perempuan​",
                "base_id": "234",
                "sort": "1"
              },
              {
                "id": "2318",
                "name": "​​Menikah Lagi​​",
                "base_id": "240",
                "sort": "2"
              },
              {
                "id": "2069",
                "name": "Ibu Rumah Tangga",
                "base_id": "183",
                "sort": "3"
              },
              {
                "id": "2585",
                "name": "Zhao Jia",
                "base_id": "264",
                "sort": "4"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "5"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "6"
              }
            ],
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_CDghH8MAbmbm3WRO.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "977",
            "hot_num": "401.0K",
            "rank_type": 3,
            "rank_order": 8,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "54",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1744277748_PewsaQc87M.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_47.jpg",
            "tag_list_with_id": [
              {
                "id": "1922",
                "name": "Obsesif",
                "base_id": "211",
                "sort": "0"
              },
              {
                "id": "1946",
                "name": "Langsung Cinta",
                "base_id": "214",
                "sort": "1"
              },
              {
                "id": "1770",
                "name": "Cinta Toksik",
                "base_id": "192",
                "sort": "2"
              },
              {
                "id": "1615",
                "name": "Mafia",
                "base_id": "172",
                "sort": "3"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "slogan": "",
            "title": "Istri Kesayangan Mafia（Dubbing）",
            "upload_num": "65",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Obsesif",
              "Langsung Cinta",
              "Cinta Toksik",
              "Mafia",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "2",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "5",
            "introduce": "Sion Sona melindungi istrinya, Nita Wara, yang perlahan-lahan mulai luluh oleh sikap lelaki itu. Eno yang mengetahui bahwa Nita sudah berpindah hati merasa tidak terima dan akhirnya membunuh ayahnya Nita dan menuduh Sion. Ketiganya terlibat berbagai masalah hingga akhirnya Sion bisa mendapatkan kembali cinta istrinya seperti yang diinginkannya, dan keduanya akhirnya bersatu.",
            "id": "977",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843009_acpooUvKFd167lCI.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3674",
            "hot_num": "395.0K",
            "rank_type": 3,
            "rank_order": 9,
            "status": "2",
            "title": "Nenek Muda: Kebangkitan Keluarga 3",
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "3674",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "0",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1761379448_QMRzEDew6K.jpg",
            "subscript": "1",
            "tag_list_with_id": [
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "0"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "1"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "2"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "3"
              },
              {
                "id": "1794",
                "name": "Alpha",
                "base_id": "195",
                "sort": "4"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "5"
              },
              {
                "id": "2552",
                "name": "Zhao Tingyi",
                "base_id": "261",
                "sort": "6"
              },
              {
                "id": "2508",
                "name": "Zeng Hui",
                "base_id": "257",
                "sort": "7"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "8"
              },
              {
                "id": "2453",
                "name": "Wang Daotie",
                "base_id": "252",
                "sort": "9"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "10"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "11"
              }
            ],
            "tag_name": [
              "Heroine",
              "Balik alur",
              "Drama Kepuasan",
              "Keluarga",
              "Alpha",
              "Wang Peiyan",
              "Zhao Tingyi",
              "Zeng Hui",
              "Li Keyi",
              "Wang Daotie",
              "Keluarga Kaya",
              "Perkotaan"
            ],
            "introduce": "Tahun 1955, Profesor Rossa meninggal secara tak terduga. Ia terbangun di tubuh gadis 18 tahun bernama sama, 70 tahun kemudian. Putranya kini jadi chairman berusia 70-an, dan ia telah punya beberapa cucu tampan. Musim ini, Rossa menghadapi peristiwa: putra ketiga Keluarga Jaya jadi bodoh, Dimas patah hati, dan Negara Suar menahan dengan jahat. Tapi, dengan kebijaksanaan dan kemampuannya, ia berhasil mengatasi semuanya!\n",
            "upload_num": "84",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1761378032_DxkQns6kb2.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843009_09Dj6bUc8Ccu2oRR.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "2186",
            "hot_num": "390.7K",
            "rank_type": 3,
            "rank_order": 10,
            "has_collection": "0",
            "language_id": "6",
            "playlet_status": "1",
            "id": "2186",
            "slogan": "",
            "gender_type": "2",
            "chapter_split_version": "0",
            "app_tag_id": "0",
            "production_type": "3",
            "recommend_config_id": "69",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1753348823_S7rpGSDnrT.jpg",
            "subscript": "1",
            "tag_list_with_id": [
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "0"
              },
              {
                "id": "1794",
                "name": "Alpha",
                "base_id": "195",
                "sort": "1"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "2"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "3"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "4"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "5"
              },
              {
                "id": "2552",
                "name": "Zhao Tingyi",
                "base_id": "261",
                "sort": "6"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "7"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "8"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "9"
              }
            ],
            "status": "2",
            "tag_name": [
              "Balik alur",
              "Alpha",
              "Lintas Waktu",
              "Heroine",
              "Drama Kepuasan",
              "Wang Peiyan",
              "Zhao Tingyi",
              "Li Keyi",
              "Keluarga",
              "Perkotaan"
            ],
            "introduce": "Pada tahun 1955, Profesor Rossa meninggal dunia secara tak terduga. Setelah membuka mata, dia justru terbangun di tubuh seorang gadis SMA berusia delapan belas tahun yang memiliki nama dan marga yang sama, tujuh puluh tahun kemudian. Kini, putranya telah menjadi seorang ketua direksi berusia lebih dari tujuh puluh tahun, dan dia bahkan memiliki beberapa cicit laki-laki yang tampan. Dalam proses menyesuaikan diri dengan kehidupan barunya, Profesor Rossa mulai menertibkan para cicitnya yang nakal dan tidak berbakti dengan kecerdasan dan kemampuannya. Di era yang benar-benar baru ini, ia pun menemukan keindahan hidupnya sendiri!",
            "upload_num": "100",
            "app_tag_name": "",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1753350963_Zztp8DkPS3.jpg",
            "title": "Nenek Muda: Kebangkitan Keluarga 2",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_LZQEBSqscnkqSKW5.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "963",
            "hot_num": "362.6K",
            "rank_type": 3,
            "rank_order": 11,
            "recommend_config_id": "54",
            "slogan": "",
            "upload_num": "65",
            "app_tag_id": "0",
            "production_type": "3",
            "playlet_status": "1",
            "subscript": "1",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_35.jpg",
            "status": "2",
            "chapter_split_version": "0",
            "language_id": "6",
            "gender_type": "2",
            "introduce": "Pernikahan Jean dan Eron hanya status saja. Eron tetap setia pada cinta lamanya, Wina. Dia memaksa Jean punya anak dengan pria asing. Jean diam-diam menggunakan uang Eron untuk nafkahi Alex, seorang model di bar. Dari hubungan yang semula pura-pura, tumbuh cinta sejati dan Jean pun mengandung anak Alex.\nSetelah Eron tahu selama ini Wina hanya menipu dia, dia memohon untuk kembali dengan Jean. Tapi, dia terkejut ketika dia tahu Alex ternyata pewaris panglima perang paling berkuasa di Erova Timur.",
            "title": "Kejayaanku Setelah Berpisah",
            "has_collection": "0",
            "tag_name": [
              "​​Balas Dendam",
              "Manis",
              "​​Menikah Lagi​​",
              "Identitas Rahasia",
              "Keluarga Kaya",
              "Selingkuhan",
              "Zhao Jia",
              "Wang Daotie",
              "Romantis",
              "Perkotaan"
            ],
            "app_tag_name": "",
            "tag_list_with_id": [
              {
                "id": "2274",
                "name": "​​Balas Dendam",
                "base_id": "236",
                "sort": "0"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "1"
              },
              {
                "id": "2318",
                "name": "​​Menikah Lagi​​",
                "base_id": "240",
                "sort": "2"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "3"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "4"
              },
              {
                "id": "2070",
                "name": "Selingkuhan",
                "base_id": "182",
                "sort": "5"
              },
              {
                "id": "2585",
                "name": "Zhao Jia",
                "base_id": "264",
                "sort": "6"
              },
              {
                "id": "2453",
                "name": "Wang Daotie",
                "base_id": "252",
                "sort": "7"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "8"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "9"
              }
            ],
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1744078502_8QdYySGE6K.jpg",
            "id": "963",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_Fm3w1NaICw60l1by.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "457",
            "hot_num": "342.0K",
            "rank_type": 3,
            "rank_order": 12,
            "tag_name": [
              "​​Balas Dendam",
              "Terlarang",
              "Manis",
              "Cinderella",
              "CEO/ Miliarder",
              "Perkotaan",
              "Romantis",
              "Cai Xinyang"
            ],
            "language_id": "6",
            "app_tag_id": "0",
            "title": "Adik lpar Memanjakanku",
            "subscript": "0",
            "production_type": "3",
            "upload_num": "52",
            "id": "457",
            "playlet_status": "1",
            "gender_type": "2",
            "recommend_config_id": "54",
            "slogan": "",
            "chapter_split_version": "0",
            "app_tag_name": "",
            "introduce": "Setelah kehilangan suaminya secara tak terduga, Jelita baru mengetahui bahwa suaminya ternyata adalah putra sulung keluarga terkaya. Dia kemudian dijemput oleh ibu mertuanya untuk tinggal di rumah Keluarga Sano. Di sana, dia sering berselisih dengan adik iparnya, lalu mereka menjadi pasangan yang saling benci, tapi juga saling suka. Meskipun demikian, keduanya selalu menahan perasaan masing-masing. Namun, setelah menghadapi sebuah krisis besar bersama, mereka akhirnya menyadari perasaan satu sama lain dan bersatu sebagai pasangan sejati.",
            "status": "2",
            "tag_list_with_id": [
              {
                "id": "2274",
                "name": "​​Balas Dendam",
                "base_id": "236",
                "sort": "0"
              },
              {
                "id": "1778",
                "name": "Terlarang",
                "base_id": "193",
                "sort": "1"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "2"
              },
              {
                "id": "1671",
                "name": "Cinderella",
                "base_id": "179",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "2745",
                "name": "Cai Xinyang",
                "base_id": "272",
                "sort": "7"
              }
            ],
            "has_collection": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1738913269_RW4cbCQ7ZH.png",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_34.jpg",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_NNUsKBPVicQVsDRQ.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "495",
            "hot_num": "317.4K",
            "rank_type": 3,
            "rank_order": 13,
            "app_tag_name": "",
            "chapter_split_version": "0",
            "recommend_config_id": "54",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739502231_p7ayaesGw5.jpg",
            "status": "2",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_47.jpg",
            "tag_list_with_id": [
              {
                "id": "1922",
                "name": "Obsesif",
                "base_id": "211",
                "sort": "0"
              },
              {
                "id": "1946",
                "name": "Langsung Cinta",
                "base_id": "214",
                "sort": "1"
              },
              {
                "id": "1770",
                "name": "Cinta Toksik",
                "base_id": "192",
                "sort": "2"
              },
              {
                "id": "1615",
                "name": "Mafia",
                "base_id": "172",
                "sort": "3"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "slogan": "",
            "title": "Istri Kesayangan Mafia",
            "upload_num": "65",
            "playlet_status": "1",
            "gender_type": "2",
            "tag_name": [
              "Obsesif",
              "Langsung Cinta",
              "Cinta Toksik",
              "Mafia",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "app_tag_id": "0",
            "has_collection": "0",
            "language_id": "6",
            "subscript": "1",
            "introduce": "Sion Sona melindungi istrinya, Nita Wara, yang perlahan-lahan mulai luluh oleh sikap lelaki itu. Eno yang mengetahui bahwa Nita sudah berpindah hati merasa tidak terima dan akhirnya membunuh ayahnya Nita dan menuduh Sion. Ketiganya terlibat berbagai masalah hingga akhirnya Sion bisa mendapatkan kembali cinta istrinya seperti yang diinginkannya, dan keduanya akhirnya bersatu.",
            "id": "495",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843007_x8VODzdJJNE3rMyp.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4187",
            "hot_num": "297.5K",
            "rank_type": 3,
            "rank_order": 14,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763977097_ByYBYPNMWk.jpg",
            "status": "2",
            "id": "4187",
            "tag_list_with_id": [
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "0"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "1"
              },
              {
                "id": "1986",
                "name": "Dua tokoh kuat",
                "base_id": "219",
                "sort": "2"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "2442",
                "name": "Ma Xiaoyu",
                "base_id": "251",
                "sort": "5"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "upload_num": "80",
            "introduce": "Resti, ketua organisasi pembunuh, masuk ke novel dan jadi istri korban Yudi. Ia ingin cepat cerai dan kembali ke dunia nyata, tapi rencana gagal karena suara hatinya terbongkar. Ia terpaksa pura-pura manja sambil adu strategi, malah bikin Yudi jatuh cinta berat.",
            "title": "Nyonya Muda Si Mulut Sial",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1763977100_a54Xfcwwry.jpg",
            "tag_name": [
              "Komedi Ringan​",
              "Romantis",
              "Dua tokoh kuat",
              "Nikah Dulu",
              "CEO/ Miliarder",
              "Ma Xiaoyu",
              "Deng Lingshu",
              "Perkotaan"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_3VNTHBoMqCCjkbgq.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "3590",
            "hot_num": "277.5K",
            "rank_type": 3,
            "rank_order": 15,
            "app_tag_name": "",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1760697161_s7e7WJ3aKz.jpg",
            "subscript": "0",
            "id": "3590",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1760697159_cy3Tpybpcj.jpg",
            "recommend_config_id": "0",
            "slogan": "",
            "upload_num": "60",
            "app_tag_id": "0",
            "production_type": "3",
            "playlet_status": "1",
            "status": "2",
            "chapter_split_version": "0",
            "language_id": "6",
            "gender_type": "2",
            "introduce": "Lahir dari desa, Rani disulitkan di kantor dan keluarga. Setelah berhubungan badan dengan Bos Grup Pratama, Arga, ia hamil tiga anak. Arga tahu dan mulai memanjakannya, membantu menghadapi tekanan kerja dan keluarga hingga mereka bahagia bersama.",
            "title": "Bos Dingin Manja Istri",
            "has_collection": "0",
            "tag_name": [
              "Kekuatan Super",
              "Cinta Semalam",
              "CEO/ Miliarder",
              "Cinderella",
              "Romantis",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1962",
                "name": "Kekuatan Super",
                "base_id": "216",
                "sort": "0"
              },
              {
                "id": "1738",
                "name": "Cinta Semalam",
                "base_id": "188",
                "sort": "1"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "2"
              },
              {
                "id": "1671",
                "name": "Cinderella",
                "base_id": "179",
                "sort": "3"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_1APa7GXoF5byWHzI.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4158",
            "hot_num": "275.8K",
            "rank_type": 3,
            "rank_order": 16,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1763717097_S2F4rQeDp4.jpg",
            "status": "2",
            "id": "4158",
            "tag_list_with_id": [
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "0"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "1"
              },
              {
                "id": "1826",
                "name": "Nikah Dulu",
                "base_id": "199",
                "sort": "2"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "3"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "4"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "2563",
                "name": "Wang Peiyan",
                "base_id": "262",
                "sort": "7"
              },
              {
                "id": "2486",
                "name": "Li Keyi",
                "base_id": "255",
                "sort": "8"
              }
            ],
            "upload_num": "79",
            "introduce": "Bos misterius Kinar Setya menikah kilat dengan playboy nomor satu Kota Jinsa, Shaka Lianto, demi merebut kembali perusahaan ibunya. Kurang dari setahun menikah, kakek Shaka sakit parah dan keluarga Lianto menghadapi krisis.\nKinar menggunakan kekuatan dan kecerdikan, menata perusahaan, mengubah suaminya yang belum dewasa, menertibkan sahabat playboy Shaka dan menyenangkan kakek-nenek mereka.\nDi keseharian penuh tawa dan air mata, Shaka perlahan dewasa, konflik Kinar dan adiknya terurai, hubungan mereka semakin kuat, bersama-sama menjaga keluarga dan bisnis.",
            "title": "Nyonya Muda Tak Terkalahkan 2",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1763717113_kWZjFF4sJM.jpg",
            "tag_name": [
              "Heroine",
              "Identitas Rahasia",
              "Nikah Dulu",
              "Komedi Ringan​",
              "Perkotaan",
              "Drama Kepuasan",
              "Romantis",
              "Wang Peiyan",
              "Li Keyi"
            ],
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_J5Zp43gOhVG8U3w3.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "533",
            "hot_num": "244.9K",
            "rank_type": 3,
            "rank_order": 17,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1739958696_ie6sC65hBK.png",
            "status": "2",
            "id": "533",
            "tag_list_with_id": [
              {
                "id": "1663",
                "name": "Paruh Baya",
                "base_id": "178",
                "sort": "0"
              },
              {
                "id": "1746",
                "name": "Nikah Kilat",
                "base_id": "189",
                "sort": "1"
              },
              {
                "id": "2002",
                "name": "Balik alur",
                "base_id": "221",
                "sort": "2"
              },
              {
                "id": "1898",
                "name": "Terpisah Keluarga",
                "base_id": "208",
                "sort": "3"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "4"
              },
              {
                "id": "1512",
                "name": "Keluarga",
                "base_id": "159",
                "sort": "5"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "6"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "7"
              }
            ],
            "upload_num": "69",
            "introduce": "Setelah Susi Darma bercerai dan anaknya hilang, dia pun membesarkan putranya seorang diri. Demi menyelamatkan putranya dan mendonorkan ginjal, putranya memilih ibunya dan bercerai. Di sisi lain, Susi Darma menolong seorang wanita dan malah dijodohkan dengan Pak Jonan, orang terkaya. Kemudian, mendapati wanita tersebut adalah putrinya yang lama menghilang. Akhirnya, mereka sekeluarga pun berkumpul kembali.",
            "title": "Menikah lagi dengan Ketua Direksi(Dubbing)",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_48.jpg",
            "tag_name": [
              "Paruh Baya",
              "Nikah Kilat",
              "Balik alur",
              "Terpisah Keluarga",
              "CEO/ Miliarder",
              "Keluarga",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "2",
            "recommend_config_id": "58",
            "chapter_split_version": "0",
            "subscript": "5",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_5VSMbrtHaKxTiMOX.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "1567",
            "hot_num": "238.0K",
            "rank_type": 3,
            "rank_order": 18,
            "playlet_status": "1",
            "gender_type": "2",
            "app_tag_id": "0",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1749462263_sSWdCySaxR.jpg",
            "status": "2",
            "id": "1567",
            "tag_list_with_id": [
              {
                "id": "1858",
                "name": "Cinta Diam",
                "base_id": "203",
                "sort": "0"
              },
              {
                "id": "2274",
                "name": "​​Balas Dendam",
                "base_id": "236",
                "sort": "1"
              },
              {
                "id": "2026",
                "name": "Cinta segi banyak",
                "base_id": "224",
                "sort": "2"
              },
              {
                "id": "1810",
                "name": "Pengkhianatan",
                "base_id": "197",
                "sort": "3"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "4"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "5"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "6"
              }
            ],
            "upload_num": "60",
            "introduce": "Dimulai dari sebuah candaan, Sela tanpa sengaja mengetahui sifat asli kekasihnya, Yuda. Saat perasaan Yuda mulai tulus, semuanya sudah terlambat. Cinta yang dibina selama tujuh tahun pun hancur. Segalanya berubah karena satu candaan yang membuka kebenaran.",
            "title": "Candaan yang Mengubah Segalanya",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_31.jpg",
            "tag_name": [
              "Cinta Diam",
              "​​Balas Dendam",
              "Cinta segi banyak",
              "Pengkhianatan",
              "Keluarga Kaya",
              "Romantis",
              "Perkotaan"
            ],
            "production_type": "3",
            "recommend_config_id": "69",
            "chapter_split_version": "0",
            "subscript": "1",
            "slogan": "",
            "app_tag_name": "",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_1tKaGwNysRbdHhSB.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "1525",
            "hot_num": "233.1K",
            "rank_type": 3,
            "rank_order": 19,
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/playletCover/playlet_square_50.jpg",
            "gender_type": "2",
            "introduce": "Pada tahun 1955, Profesor Rossa meninggal dunia secara tak terduga. Setelah membuka mata, dia justru terbangun di tubuh seorang gadis SMA berusia delapan belas tahun yang memiliki nama dan marga yang sama, tujuh puluh tahun kemudian. Kini, putranya telah menjadi seorang ketua direksi berusia lebih dari tujuh puluh tahun, dan dia bahkan memiliki beberapa cicit laki-laki yang tampan. Dalam proses menyesuaikan diri dengan kehidupan barunya, Profesor Rossa mulai menertibkan para cicitnya yang nakal dan tidak berbakti dengan kecerdasan dan kemampuannya. Di era yang benar-benar baru ini, ia pun menemukan keindahan hidupnya sendiri!",
            "id": "1525",
            "app_tag_name": "",
            "subscript": "1",
            "app_tag_id": "0",
            "recommend_config_id": "69",
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1749034152_x7YDz67FXT.jpg",
            "tag_name": [
              "Heroine",
              "Drama Kepuasan",
              "Keluarga Kaya",
              "Alpha",
              "Lintas Waktu",
              "Perkotaan"
            ],
            "tag_list_with_id": [
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "0"
              },
              {
                "id": "2285",
                "name": "Drama Kepuasan",
                "base_id": "237",
                "sort": "1"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "2"
              },
              {
                "id": "1794",
                "name": "Alpha",
                "base_id": "195",
                "sort": "3"
              },
              {
                "id": "1802",
                "name": "Lintas Waktu",
                "base_id": "196",
                "sort": "4"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "5"
              }
            ],
            "title": "Nenek Muda: Kebangkitan Keluarga",
            "language_id": "6",
            "has_collection": "0",
            "production_type": "3",
            "status": "2",
            "playlet_status": "1",
            "upload_num": "47",
            "slogan": "",
            "chapter_split_version": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_zEgi6ggioHm5INrY.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          },
          {
            "playlet_id": "4511",
            "hot_num": "230.0K",
            "rank_type": 3,
            "rank_order": 20,
            "status": "2",
            "id": "4511",
            "tag_list_with_id": [
              {
                "id": "1730",
                "name": "Hubungan Kontrak",
                "base_id": "187",
                "sort": "0"
              },
              {
                "id": "1762",
                "name": "Manis",
                "base_id": "191",
                "sort": "1"
              },
              {
                "id": "2307",
                "name": "Komedi Ringan​",
                "base_id": "239",
                "sort": "2"
              },
              {
                "id": "1583",
                "name": "CEO/ Miliarder",
                "base_id": "168",
                "sort": "3"
              },
              {
                "id": "1639",
                "name": "Keluarga Kaya",
                "base_id": "175",
                "sort": "4"
              },
              {
                "id": "1631",
                "name": "Identitas Rahasia",
                "base_id": "174",
                "sort": "5"
              },
              {
                "id": "1687",
                "name": "Heroine",
                "base_id": "181",
                "sort": "6"
              },
              {
                "id": "2070",
                "name": "Selingkuhan",
                "base_id": "182",
                "sort": "7"
              },
              {
                "id": "2475",
                "name": "Deng Lingshu",
                "base_id": "254",
                "sort": "8"
              },
              {
                "id": "1504",
                "name": "Romantis",
                "base_id": "158",
                "sort": "9"
              },
              {
                "id": "1464",
                "name": "Perkotaan",
                "base_id": "153",
                "sort": "10"
              }
            ],
            "upload_num": "73",
            "introduce": "Yunta Cahya sadar kalau Joko Sidjaja, cowok dingin yang dia pelihara, diam-diam punya pacar.\nMaka Yunta langsung ambil keputusan, di pinggir jalan dia cari cowok lain buat jadi kekasih baru.\nCowok itu nggak cuma nurut dan pengertian, tapi juga profesional, sering bikin Yunta senang.\nTapi ternyata cowok manis dan pengertian itu adalah pewaris Grup Solihin, Yohan Solihin. Saat itu Yohan pakai nama Surya, kabur dari rumah demi mengejar impian di dunia hiburan.\nYunta sejak kecil melihat kakaknya disakiti pacarnya, jadi dia nggak ngerti cinta, takut jatuh cinta, cuma berani dekat dengan orang yang dia suka lewat cara peliharaan.\nDua orang yang masing-masing punya beban hati, setelah lama bersama akhirnya berani hadapi perasaan sendiri, nyelesain salah paham, dan hidup bahagia.",
            "title": "Romansa di Rumah Mewah",
            "language_id": "6",
            "cover_square": "https://zshipubcdn.farsunpteltd.com/playlet/1765448226_pGeTCmMT7y.jpg",
            "tag_name": [
              "Hubungan Kontrak",
              "Manis",
              "Komedi Ringan​",
              "CEO/ Miliarder",
              "Keluarga Kaya",
              "Identitas Rahasia",
              "Heroine",
              "Selingkuhan",
              "Deng Lingshu",
              "Romantis",
              "Perkotaan"
            ],
            "cover": "https://zshipubcdn.farsunpteltd.com/playlet/1765448223_YRXr6zRcCW.jpg",
            "production_type": "3",
            "recommend_config_id": "0",
            "chapter_split_version": "0",
            "subscript": "0",
            "slogan": "",
            "app_tag_name": "",
            "playlet_status": "1",
            "app_tag_id": "0",
            "gender_type": "2",
            "has_collection": "0",
            "rank_url": "https://zshipubcdn.farsunpteltd.com/playlet/1750843008_g84hLItGr9Nj8POX.png",
            "hot_url": "https://zshipubcdn.farsunpteltd.com/playlet/1762408951_ESj829SMsWEa98QM.png"
          }
        ]
      }
    ],
    "extra": {},
    "request_id": "0ec326341c6cf3db815063b9c0cc663a",
    "trace_id": "605448cf60d73ffae31db3a0f710009d"
  },
  "timestamp": "2026-01-01T06:31:02.916Z"
}

```