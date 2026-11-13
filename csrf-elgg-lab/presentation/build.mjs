// Run from the lab root: node presentation/build.mjs
// Requires @oai/artifact-tool. Source is also delivered in presentation/build.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const root = path.resolve(process.env.LAB_ROOT || process.cwd());
const tmp = path.join(root,'.build/presentation');
const out = path.join(root,'presentation');
const require = createRequire(path.join(tmp,'package.json'));
const modulePath = process.env.ARTIFACT_TOOL_MODULE || require.resolve('@oai/artifact-tool');
const { Presentation, PresentationFile } = await import(pathToFileURL(modulePath).href);
await fs.mkdir(out,{recursive:true});
await fs.mkdir(tmp,{recursive:true});
const deck = Presentation.create({slideSize:{width:1280,height:720}});
const colors={ink:'#101820',muted:'#526173',blue:'#2361A8',pale:'#EDEDED',rule:'#C9D1DB'};
const layout=[];
const notes=[];
const sources={
  seed:'https://seedsecuritylabs.org/Labs_20.04/Web/Web_CSRF_Elgg/',
  fetch:'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
  cookie:'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
  elgg:'https://learn.elgg.org/en/stable/guides/actions.html',
  owasp:'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
  local:'Bằng chứng của dự án: evidence/logs/browser-echo.json; tests; docs/05-test-results.md. Chỉ TC-02 đã chạy Chrome; Elgg NOT RUN.'
};
function text(slide,name,value,x,y,w,h,size=30,options={}){
 const shape=slide.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 shape.text=value;
 shape.text.style={fontSize:size,typeface:options.mono?'Consolas':'Arial',color:options.color||colors.ink,bold:options.bold||false,
   alignment:options.align||'left',verticalAlignment:'top',autoFit:'none',
   insets:{top:0,right:0,bottom:0,left:0}};
 layout.push({slide:deck.slides.items.length,name,x,y,w,h,type:'text'});
 return shape;
}
function shape(s,name,geometry,x,y,w,h,fill=colors.pale){
 const result=s.shapes.add({name,geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});
 layout.push({slide:deck.slides.items.length,name,x,y,w,h,type:'shape'});return result;
}
function base(title){
 const s=deck.slides.add();s.background.fill='#FFFFFF';
 text(s,'title',title,48,38,1184,96,48,{bold:true});
 text(s,'footer','NHÓM 6 / CSRF ON ELGG',48,671,1000,26,22,{color:colors.muted});
 text(s,'page',String(deck.slides.items.length).padStart(2,'0'),1160,671,72,26,22,{color:colors.muted,align:'right'});
 return s;
}
function note(s,seconds,body,refs=[]){
 const value=`Thời lượng: ${seconds} giây.\n\n${body}\n\n[Sources]\n${refs.map(k=>sources[k]||k).join('\n')}\n[/Sources]`;
 s.speakerNotes.textFrame.setText(value);notes.push({slide:deck.slides.items.length,seconds,body});
}
function column(s,id,head,body,x,y=220,w=550){
 text(s,id+'-head',head,x,y,w,60,34,{bold:true});
 text(s,id+'-body',body,x,y+90,w,290,30,{color:colors.muted});
}
function takeaway(s,value){text(s,'takeaway',value,48,602,1184,59,28,{color:colors.blue});}

// Codex Grid #01: cover with stacked eyebrow, headline, subtitle regions.
{
 const s=deck.slides.add();s.background.fill='#FFFFFF';
 text(s,'eyebrow','AN TOÀN MÁY TÍNH / NHÓM 6 — CSRF',48,42,1184,46,28,{color:colors.blue});
 text(s,'cover-title','CSRF trên Elgg\nbằng Fetch API',48,170,1184,220,80,{bold:true});
 text(s,'names','Nguyễn Trung Thành · 23001935\nNguyễn Công Trí · 23001939\nNguyễn Minh Thao · 23001936',48,466,1184,130,30);
 text(s,'scope','Môi trường SEED cục bộ · Tài khoản giả lập Alice',48,654,1184,36,24,{color:colors.muted});
 note(s,30,'Nhóm 6 giới thiệu đề tài Cross-Site Request Forgery Attack on Elgg. Mục tiêu là giải thích và kiểm chứng một yêu cầu thay đổi About me được phát sinh từ trang khác origin trong trình duyệt đang đăng nhập Alice. Mã gửi yêu cầu phải dùng Fetch API và URLSearchParams. Thí nghiệm chỉ áp dụng tài khoản giả lập trong môi trường cục bộ. Trong bản trình bày này, phần echo đã chạy thật, còn thực nghiệm Elgg chưa chạy được vì lỗi lưu trữ Docker; nhóm sẽ phân biệt rõ hai mức bằng chứng.',['seed','local']);
}
// Codex Grid #04: two content columns.
{
 const s=base('Đích đến là dữ liệu profile thực sự đổi');
 column(s,'goal','About me của Alice','Giá trị cần kiểm chứng:\n\nCSRF attack by 23001939\n\nMSV có thể thay qua cấu hình.',48);
 column(s,'rules','Yêu cầu triển khai','Fetch API + URLSearchParams\n\nTrang attacker khác origin\n\nBằng chứng trước / sau\n\nexploit.py phục vụ trang attacker',682);
 takeaway(s,'Chỉ PASS khi tải mới profile Elgg và thấy đúng chuỗi yêu cầu.');
 note(s,40,'Đề bài yêu cầu thay đổi trường About me, không phải chỉ gửi được HTTP request. Chuỗi cuối cùng là CSRF attack by 23001939, lấy mã sinh viên của Nguyễn Công Trí; có thể đổi qua giao diện hoặc môi trường. Trang attacker không dùng XHR hay submit form truyền thống. Python có vai trò launcher phục vụ trang, còn payload thực thi trong trình duyệt. Cách diễn giải exploit.py này cần giảng viên xác nhận. Tiêu chuẩn đánh giá là dữ liệu Elgg sau khi tải lại, kèm profile ban đầu và request đã quan sát; một thông báo trên attacker chưa chứng minh được điều đó.',['local']);
}
// Codex Grid #06: three columns, three necessary conditions.
{
 const s=base('CSRF dựa vào phiên và thiếu kiểm tra ý định');
 for(const [i,h,b] of [
  [0,'Phiên đang có','Alice đã đăng nhập.\nCookie còn hiệu lực\nvà được phép gửi.'],
  [1,'Request phù hợp','Attacker biết endpoint\nvà các trường cần thiết\ntừ phân tích hợp lệ.'],
  [2,'Máy chủ chấp nhận','Quyền sửa phù hợp;\nkiểm tra ý định thiếu\nhoặc bị tắt trong lab.']]){
   const x=48+i*412;text(s,`n-${i}`,String(i+1).padStart(2,'0'),x,210,350,60,48,{color:colors.blue});
   text(s,`h-${i}`,h,x,330,360,60,34,{bold:true});text(s,`b-${i}`,b,x,421,360,150,30,{color:colors.muted});
 }
 takeaway(s,'Attacker không cần đọc cookie; trình duyệt quyết định việc gửi cookie.');
 note(s,50,'Ba điều kiện cần được kiểm chứng riêng. Thứ nhất Alice có phiên hợp lệ và chính sách cookie cho phép gửi. Thứ hai payload đúng endpoint và tên trường của phiên bản đang chạy. Thứ ba server chấp nhận quyền sửa và chưa kiểm tra đủ ý định người dùng. Cookie HttpOnly ngăn script đọc giá trị nhưng không ngăn browser gửi cookie đến đúng host. Vì vậy attacker không cần đánh cắp cookie để CSRF có thể xảy ra. Tuy nhiên chỉ có cookie cũng chưa đủ: token hoặc kiểm tra nguồn có thể từ chối yêu cầu. Đây là lý do phải dùng đối chứng thay vì suy ra thành công từ việc gọi fetch.',['owasp','cookie']);
}
// Requested simple sequence diagram. Arrows/lifelines precede actor nodes and labels.
{
 const s=base('Theo dõi request từ trình duyệt đến Elgg');
 for(const [id,x] of [['attacker',220],['browser',640],['elgg',1060]]) shape(s,'life-'+id,'rect',x,204,2,372,colors.rule);
 const flows=[
  [640,1060,245,'1. Đăng nhập hợp lệ',false],
  [640,1060,318,'2. Cookie phiên',true],
  [220,640,391,'3. Tải JavaScript attacker',false],
  [640,1060,464,'4. POST + cookie đủ điều kiện',false],
  [640,1060,537,'5. Tải lại profile để xác minh',false]
 ];
 flows.forEach(([x1,x2,y,label,left],i)=>shape(s,'arrow-'+i,left?'leftArrow':'rightArrow',x1+5,y,x2-x1-10,15,colors.blue));
 for(const [id,x,label] of [['attacker',68,'Attacker'],['browser',488,'Browser Alice'],['elgg',908,'Elgg']]){
  shape(s,id,'rect',x,150,304,57);text(s,id+'-label',label,x+12,160,280,40,30,{bold:true,align:'center'});
 }
 flows.forEach(([x1,x2,y,label],i)=>text(s,'message-'+i,label,x1+10,y-35,x2-x1-20,34,23,{color:colors.muted}));
 takeaway(s,'Server kiểm tra phiên, quyền và CSRF token trước khi đổi dữ liệu.');
 note(s,55,'Đọc sơ đồ theo thứ tự thời gian từ trên xuống. Alice đăng nhập Elgg trước và browser nhận cookie. Khi mở attacker, browser nhận JavaScript thuộc origin attacker. Fetch tạo POST trực tiếp đến Elgg; server attacker không chuyển tiếp request và không cấp cookie Alice. Browser tự đánh giá cookie theo host, site và thuộc tính. Elgg tiếp tục kiểm tra session, quyền và token. Sau đó người thực nghiệm điều hướng riêng về profile để xem dữ liệu. CORS có thể khiến JavaScript attacker không đọc được response sau khi simple POST đã được xử lý. Mũi tên cuối, tải lại profile, là bước quyết định kết luận của bài.',['seed','fetch','cookie']);
}
// Requested architecture diagram, all connectors created before entity nodes.
{
 const s=base('Hai origin riêng, một lab cục bộ');
 shape(s,'browser-elgg','rightArrow',365,263,85,22,colors.blue);
 shape(s,'elgg-db','rightArrow',790,263,85,22,colors.blue);
 shape(s,'browser-attacker','downArrow',185,340,22,82,colors.blue);
 for(const [id,x,y,h,b] of [
  ['browser',48,210,'Browser Alice','Phiên đăng nhập Elgg'],
  ['elgg',472,210,'Elgg / Apache',':8080 · token mode'],
  ['db',896,210,'MySQL 8.0.37','Không publish cổng'],
  ['attacker',48,440,'Attacker / Python',':8000 · trang Fetch']]){
   shape(s,id,'rect',x,y,336,125);text(s,id+'-h',h,x+18,y+18,300,45,31,{bold:true});
   text(s,id+'-b',b,x+18,y+76,300,36,24,{color:colors.muted});
 }
 text(s,'host-elgg','elgg.csrf.localhost',473,373,720,44,30,{color:colors.blue});
 text(s,'host-attacker','attacker.csrf.localhost',473,448,720,44,30,{color:colors.blue});
 text(s,'site-note','Khác origin, cùng site csrf.localhost.\n127.0.0.1 dùng cho đối chứng cross-site.',473,509,720,78,27,{color:colors.muted});
 takeaway(s,'Chỉ mở cổng ở 127.0.0.1; Fetch đi trực tiếp tới Elgg.');
 note(s,55,'Compose gồm Elgg, MySQL và Python attacker trong network nội bộ. Chỉ Elgg 8080 và attacker 8000 bind loopback; MySQL không có cổng host. Hai hostname giữ cookie host-only của Elgg không đi tới attacker. Hai origin vẫn cùng site csrf.localhost nên thí nghiệm này mô phỏng khả năng kiểm soát một subdomain cùng site; phải công bố giới hạn đó. Truy cập attacker qua 127.0.0.1 tạo đối chứng khác site để quan sát SameSite. Image chọn từ SEED vì bộ dữ liệu phục vụ môn học, không đại diện Elgg hiện hành. Phiên bản chính xác và digest chưa xác minh vì Docker pull lỗi; cần bổ sung trước khi báo cáo kết quả Elgg.',['seed','cookie','local']);
}
// Codex Grid #04 with reserved evidence region.
{
 const s=base('Request Edit Profile phải lấy từ Network');
 column(s,'capture','Ghi từ thao tác Save','URL · method · Content-Type\n\nCác trường công khai\n\nTên token và thuộc tính cookie\n\nStatus, redirect và dữ liệu sau lưu',48,200,550);
 shape(s,'runtime-evidence','rect',682,200,550,352);
 text(s,'runtime-status','NOT RUN',710,236,494,62,48,{bold:true,color:colors.blue});
 text(s,'runtime-instruction','Chưa có capture Elgg.\n\nVị trí ảnh Network thực tế\nvà danh sách field đã xác nhận.',710,330,494,170,30,{color:colors.muted});
 takeaway(s,'Không đưa giá trị session cookie hoặc CSRF token vào slide / Git.');
 note(s,55,'Thực hiện Save hợp lệ trong Elgg khi DevTools Network đang mở, bật Preserve log để thấy cả chuỗi redirect. Ghi URL và method thực tế, Content-Type, tên các trường trong body, cookie có được gửi không và những thuộc tính liên quan. Chỉ lưu tên token, không lưu giá trị. Thông tin profile/edit và description trong tài liệu SEED là tham khảo, chưa phải capture của nhóm. Bản hiện tại để NOT RUN vì Elgg chưa khởi động. Khi có môi trường khỏe, thay vùng bằng chứng bằng ảnh đã khử bí mật, điền bảng ghi nhận và kiểm tra lại dữ liệu profile. Không kết luận chỉ từ HTTP 200 vì đó có thể là trang login sau redirect.',['seed','elgg','local']);
}
{
 const s=base('Fetch tạo POST, browser quản lý cookie');
 text(s,'code',"const body = new URLSearchParams(fields);\nbody.set('description', message);\n\nawait fetch(observedEndpoint, {\n  method: 'POST',\n  credentials: 'include',\n  mode: 'cors',\n  body\n});",48,190,1184,335,29,{mono:true});
 text(s,'implementation','URLSearchParams tự tạo Content-Type phù hợp.\nPython phục vụ trang và echo; không proxy request Elgg.',48,550,1184,78,29,{color:colors.blue});
 note(s,55,'Đoạn mã có bốn điểm cần giải thích. Fields lấy từ request hợp lệ đã quan sát, giữ các trường công khai cần thiết và thay description bằng chuỗi theo MSV. URLSearchParams thực hiện percent encoding và tạo Content-Type urlencoded; không cần thêm header tùy tiện. credentials include không vượt qua SameSite hay chính sách cookie. mode cors yêu cầu tuân theo quyền đọc response của server; nếu đổi no-cors thì response opaque, không phải thành công. Implementation từ chối token, cookie và mật khẩu trong field, giới hạn target về lab cục bộ, không tự gửi lúc tải trang. exploit.py chỉ là web server. TC-02 đã chạy Fetch trong Chrome, còn áp dụng trên Elgg cần request capture và lab khỏe.',['fetch','cookie','local']);
}
// Codex Grid #17: three-stage timeline, lower region holds test sequence.
{
 const s=base('Đổi một điều kiện để giải thích kết quả');
 shape(s,'timeline','rect',48,325,1184,2,colors.rule);
 for(const [i,head,body] of [
  [0,'Chuẩn bị','TC-01 · Save hợp lệ\nTC-02 · Kiểm tra echo\nGhi baseline và field'],
  [1,'Đối chứng','TC-03 · Origin / site\nTC-04 · Token bật\nQuan sát cookie và CORS'],
  [2,'Xác minh','TC-05 · Lab vulnerable\nTC-06 · Tải lại profile\nKhôi phục protected']]){
   const x=48+i*412;shape(s,'dot-'+i,'ellipse',x,318,16,16,colors.blue);
   text(s,'step-'+i,'0'+(i+1),x,220,360,70,52,{color:colors.blue});
   text(s,'head-'+i,head,x,375,360,60,34,{bold:true});
   text(s,'body-'+i,body,x,455,360,125,28,{color:colors.muted});
 }
 takeaway(s,'Giữ cùng phiên, payload và baseline khi so sánh token mode.');
 note(s,50,'Trình tự gồm chuẩn bị, đối chứng và xác minh. Save hợp lệ cho baseline và capture field; echo xác nhận encoder. Sau đó dùng đúng payload để so khác origin cùng site và khác site, đồng thời ghi việc cookie được gửi hay bị loại. Với token bật, profile phải không đổi và cần có thông báo từ chối tương ứng. Chỉ trong lab chuyển vulnerable, giữ các điều kiện khác và gửi lại. Cuối cùng tải mới profile, kiểm tra chuỗi chính xác và các trường khác, chụp bằng chứng, rồi bật lại protected và reset. Nếu một bước không chạy hoặc không quan sát được, ghi NOT RUN hoặc FAIL thay vì suy diễn.',['local','seed']);
}
// Evidence: one real screenshot, original proportions retained.
{
 const s=base('Echo đã đạt; thực nghiệm Elgg còn thiếu');
 text(s,'result-head','TC-02 / PASS',48,198,450,66,42,{bold:true,color:colors.blue});
 text(s,'result-body','Chrome đã gửi Fetch.\nServer nhận đúng\ndescription theo MSV.\n\n6 JS tests + 4 HTTP tests đạt.\n\nElgg TC-01 / 03 / 04 / 05 / 06:\nNOT RUN do Docker lỗi lưu trữ.',48,300,470,292,28,{color:colors.muted});
 const png=await fs.readFile(path.join(root,'evidence/screenshots/TC-02-decoded-body.png'));
 s.images.add({name:'TC-02-real-capture',blob:png,contentType:'image/png',fit:'contain',
   alt:'Ảnh Chrome thật của echo: description CSRF attack by 23001939; không phải kết quả Elgg.',
   position:{left:558,top:198,width:674,height:390}});
 text(s,'evidence-caption','Ảnh thật / evidence/screenshots/TC-02-decoded-body.png',558,605,674,42,22,{color:colors.muted});
 note(s,60,'Bằng chứng bên phải là ảnh chụp từ Chrome của chính endpoint thử nghiệm trong dự án. Browser đã thực thi Fetch, Python nhận body urlencoded và decode ra đúng description. Unit tests cũng kiểm tra Unicode, ký tự đặc biệt, field lặp, chống nhập secret và giới hạn URL; HTTP tests kiểm tra server và việc không phục vụ file ngoài allowlist. Kết quả này không khẳng định Elgg đã đổi profile. Docker pull Elgg và MySQL gặp input/output khi ổ đĩa gần đầy, nên chưa chạy các TC trên Elgg, chưa có capture Save, version ứng dụng hoặc ảnh trước sau. Slide cố tình ghi NOT RUN để người nghe đánh giá đúng mức bằng chứng. Sau khi môi trường được sửa, nhóm bổ sung kết quả thật.',['local']);
}
// Codex Grid #06: defense comparison across three columns.
{
 const s=base('Token là đối chứng chính của bài thực hành');
 for(const [i,h,b] of [
  [0,'CSRF token','Server kiểm tra ý định.\n\nSo cùng payload khi\nbật / tắt có kiểm soát.'],
  [1,'SameSite cookie','Browser giới hạn cookie\ntheo ngữ cảnh site.\n\nSame-site vẫn cần token.'],
  [2,'SOP / CORS','Quyền đọc response\nvà preflight theo request.\n\nLỗi CORS chưa nói\nprofile có đổi hay không.']]){
  const x=48+i*412;text(s,'h-'+i,h,x,226,360,60,34,{bold:true});text(s,'b-'+i,b,x,326,360,238,29,{color:colors.muted});
 }
 takeaway(s,'Bổ sung kiểm quyền, Origin / Referer, Fetch Metadata và HTTPS khi thiết kế phù hợp.');
 note(s,55,'Đối chứng token cần giữ các điều kiện khác cố định. Nếu protected và vulnerable đều thất bại, chưa thể quy nguyên nhân cho token; có thể request thiếu session hoặc sai field. Nếu cả hai thành công, phải kiểm tra mode thực tế hoặc xem token đã bị đưa nhầm vào payload chưa. SameSite là lớp browser bổ sung, có khác biệt giữa cùng site và khác site. CORS không phải cơ chế đủ để chống mọi CSRF vì simple POST có thể đi trước khi response bị chặn đọc. Với hệ thống thật, dùng middleware của framework, kiểm quyền đối tượng, cookie phù hợp, HTTPS và kiểm nguồn khi phù hợp. Các lớp bổ sung này là phân tích khuyến nghị; chưa được triển khai hay kiểm thử trên Elgg trong bản này.',['owasp','elgg','fetch','cookie']);
}
// Codex Grid #04: proposed ownership and actual AI disclosure.
{
 const s=base('Phân công đề xuất và mức sử dụng AI');
 text(s,'roles-head','Ba thành viên, ba phần việc',48,192,550,54,34,{bold:true});
 text(s,'roles','Nguyễn Trung Thành · 23001935\nLý thuyết, request, phòng chống\n\nNguyễn Công Trí · 23001939\nMôi trường, Fetch, kiểm thử\n\nNguyễn Minh Thao · 23001936\nBằng chứng, slide, video',48,282,550,315,28,{color:colors.muted});
 column(s,'ai','Mức 3 theo đề bài','AI tạo khung thiết kế, mã,\ntài liệu và slide theo prompt.\n\nSinh viên cần chạy Elgg,\nphản biện, chỉnh sửa, thu bằng chứng\nvà chịu trách nhiệm nội dung.',682,192,550);
 takeaway(s,'Chưa ghi nhận sinh viên tự chỉnh code / chạy Elgg; cập nhật log khi thực hiện.');
 note(s,55,'Bảng phân công là đề xuất dựa trên thông tin nhóm cung cấp, cần nhóm xác nhận theo việc thực tế. Thành nghiên cứu và tổng hợp HTTP/phòng chống; Trí triển khai môi trường và Fetch; Thao phụ trách bằng chứng, PowerPoint và video. Về AI, sản phẩm hiện tại được tạo thiết kế và triển khai theo prompt nên phù hợp mức 3 của giảng viên, không khai thành chỉ góp ý. Sinh viên cung cấp mục tiêu, thành viên và yêu cầu công nghệ; AI tạo mã và tài liệu, chạy các kiểm tra cục bộ có thể thực hiện. Phần Elgg, video và việc chỉnh sửa của sinh viên chưa được xác nhận. Khi làm tiếp, nhóm ghi người sửa, file, lý do và cách kiểm chứng trong AI Usage Log.',['local']);
}
// Codex Grid #01/#26: closing thesis and concrete evidence limits.
{
 const s=base('Kết luận cần đi cùng bằng chứng');
 text(s,'closing','Fetch không vượt qua\nchính sách của trình duyệt.',48,192,1184,140,56,{bold:true});
 text(s,'conclusion','Đã chứng minh đóng gói và gửi request tới echo.\n\nCòn cần: Elgg chạy, capture Network và profile trước / sau.\n\nBảo vệ token và SameSite phải được thử bằng đối chứng.',48,394,1184,186,32,{color:colors.muted});
 text(s,'qa','Q&A · Vì sao CORS error vẫn cần kiểm tra lại dữ liệu?',48,618,1184,45,30,{color:colors.blue});
 note(s,40,'Kết luận của bản này có giới hạn rõ: đã kiểm chứng Fetch và URLSearchParams trên echo bằng Chrome, chưa chứng minh CSRF trên Elgg. Fetch tuân thủ cookie, SameSite, SOP/CORS và bảo vệ phía server. Nhóm cần xử lý Docker, ghi phiên bản, bắt request thật, chạy token mode đối chứng và tải mới profile để hoàn tất bài. Sau đó mới quay video đầy đủ và nộp link unlisted. Câu hỏi thảo luận là tại sao lỗi CORS không đủ để kết luận server chưa thay đổi dữ liệu: với simple request, quyền gửi và quyền đọc response là hai vấn đề khác nhau.',['fetch','local']);
}

if(notes.reduce((sum,item)=>sum+item.seconds,0)!==600) throw new Error('Expected 600 seconds of notes');
await fs.writeFile(path.join(tmp,'bounds.json'),JSON.stringify(layout,null,2));
await fs.writeFile(path.join(tmp,'source-notes.txt'),Object.entries(sources).map(([key,value])=>`${key}: ${value}`).join('\n')+'\nDesign: Codex Grid #01, #04, #06, #13, #17. Native diagrams were requested. Screenshot is actual local Chrome TC-02, no Elgg image fabricated.\n');
await fs.writeFile(path.join(out,'speaker-notes.md'),'# Lời thuyết trình — 600 giây\n\n'+notes.map(n=>`## Slide ${n.slide} — ${n.seconds} giây\n\n${n.body}`).join('\n\n'));
const file=await PresentationFile.exportPptx(deck);
await file.save(path.join(out,'Nhom6_CSRF_Elgg.pptx'));
await fs.rename(path.join(out,'Nhom6_CSRF_Elgg.pptx.inspect.ndjson'),path.join(tmp,'deck.inspect.ndjson')).catch(error=>{if(error.code!=='ENOENT')throw error;});
for(let index=0;index<deck.slides.items.length;index++){
 const slide=deck.slides.items[index];
 const png=await deck.export({slide,format:'png',scale:1});
 await fs.writeFile(path.join(tmp,`slide-${String(index+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
 const data=await slide.export({format:'layout'});
 await fs.writeFile(path.join(tmp,`slide-${String(index+1).padStart(2,'0')}.layout.json`),await data.text());
}
console.log('Exported 12 slides, 600 seconds, PNG previews and speaker notes.');
process.exit(0);
