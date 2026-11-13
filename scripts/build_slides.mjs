// Build: node scripts/build_slides.mjs
// Requires @oai/artifact-tool in .build/slides/node_modules or a normal Node search path.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(root, '.build/slides');
const require = createRequire(path.join(tmp, 'package.json'));
const { Presentation, PresentationFile } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
await fs.mkdir(path.join(root, 'output'), { recursive: true });
await fs.mkdir(tmp, { recursive: true });
const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const ink='#141414', muted='#4B4B4B', accent='#2361A8', pale='#EDEDED';
const refs = {
  lab: 'Web_CSRF_Elgg.pdf, SEED Labs, mục 2, 3.3, 4.1 (tài liệu trong dự án). https://seedsecuritylabs.org/Labs_20.04/Web/Web_CSRF_Elgg/',
  lecture: '10_Web_CSRF.pptx, slide 10, 24–28, 31–36 (bài giảng trong dự án).',
  req: 'README.md (đề bài gốc trong dự án).',
  fetch: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
  cookies: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
  defense: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
};
const boxLog=[];
function text(s, name, content, x,y,w,h,size=30,opts={}){
  const sh=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  sh.text=content;
  sh.text.style={fontSize:size,typeface:opts.mono?'Consolas':'Arial',color:opts.color??ink,bold:opts.bold??false,alignment:opts.align??'left',verticalAlignment:'top',autoFit:'none',insets:{top:0,right:0,bottom:0,left:0},...opts.style};
  boxLog.push({slide:p.slides.items.length,name,x,y,w,h,role:opts.role??'text'});
  return sh;
}
function base(title){
  const s=p.slides.add();s.background.fill='#FFFFFF';
  text(s,'title',title,48,38,1184,90,48,{bold:true,role:'title'});
  text(s,'page',String(p.slides.items.length).padStart(2,'0'),1165,664,67,28,22,{color:muted,align:'right'});
  return s;
}
function note(s,seconds,body,sources=[]){
  s.speakerNotes.textFrame.setText(`Thời lượng dự kiến: ${seconds} giây.\n\n${body}\n\n[Sources]\n${sources.map(k=>refs[k]??k).join('\n')}\n[/Sources]`);
}
function column(s,name,head,body,x,y=214,w=568){
  text(s,`${name}-heading`,head,x,y,w,54,34,{bold:true});
  text(s,`${name}-body`,body,x,y+78,w,322,30,{color:muted});
}
function group(s,n,title,body,x,y){
  text(s,`${n}-heading`,title,x,y,565,48,33,{bold:true});
  text(s,`${n}-body`,body,x,y+59,565,116,28,{color:muted});
}

// Adapted Codex Grid layouts 01 (cover), 04/05 (split), 06 (three columns),
// 13 (four topics), 17 (sequence); hierarchy and white/black visual system retained.
{
const s=p.slides.add();s.background.fill='#FFFFFF';
text(s,'eyebrow','AN TOÀN MẠNG • BÀI THỰC HÀNH',48,48,1184,54,30,{color:muted});
text(s,'cover-title','CSRF trên Elgg\nbằng Fetch API',48,190,1184,232,76,{bold:true,role:'title'});
text(s,'cover-subtitle','Thay đổi trường About me trong môi trường SEED Lab',48,505,1184,92,34);
text(s,'scope','Bản chuẩn bị thực hành • Chưa có bằng chứng chạy trên Elgg',48,646,1100,38,23,{color:muted});
note(s,30,'Giới thiệu mục tiêu: giải thích cách một trang khác tạo yêu cầu thay đổi hồ sơ khi trình duyệt đang có phiên Elgg. Sản phẩm cần dùng Fetch API và URLSearchParams. Bài này chỉ thực hiện trong môi trường lab của môn học. Bản trình bày hiện có mã và quy trình; nhóm còn cần chạy Elgg, thêm thông tin thành viên, chụp bằng chứng và quay video trước khi nộp. Không mô tả kết quả chưa quan sát thành thành công.', ['req','lab']);
}
{
const s=base('Yêu cầu cần kiểm chứng');
column(s,'goal','Nội dung hồ sơ', 'About me hiển thị đúng:\n\nCSRF attack by <MSV>\n\nMSV lấy từ một thành viên nhóm.',48);
column(s,'deliver','Sản phẩm cần nộp','exploit.py và trang index.html\n\nPowerPoint trình bày 10 phút\n\nVideo YouTube ở chế độ unlisted\n\nCông bố phần việc có AI hỗ trợ',664);
note(s,45,'Đề bài tập trung vào trường About me. Không nhầm với Brief description, vì hai trường này có tên tham số khác nhau. Nội dung cuối phải thay MSV bằng mã sinh viên thật; dấu ngoặc chỉ biểu thị vị trí thay thế. Python chuẩn bị tệp HTML, còn trình duyệt nạn nhân mới là nơi gửi yêu cầu sử dụng phiên đăng nhập. Nhóm phải chứng minh payload dùng fetch kết hợp URLSearchParams hoặc FormData, không dùng XMLHttpRequest và không dùng thao tác submit form truyền thống. Các sản phẩm nộp gồm mã, slide và liên kết video unlisted theo hướng dẫn lớp.', ['req']);
}
{
const s=base('Hai bộ tài liệu dùng hai tên miền');
column(s,'docker','SEED Lab dùng container','Elgg: www.seed-server.com\n\nAttacker: www.attacker32.com\n\nIP lab: 10.9.0.5 / 10.9.0.105\n\nThư mục: Labsetup/attacker',48);
column(s,'legacy','Máy ảo trong bài giảng','Elgg: www.csrflabelgg.com\n\nAttacker: www.csrflabattacker.com\n\nApache virtual host trên máy ảo\n\nThư mục: /var/www/CSRF/Attacker',664);
text(s,'environment-note','Chọn đúng môi trường đang chạy và bắt lại request; không trộn hostname giữa hai bản.',48,605,1184,58,26,{color:accent});
note(s,55,'PDF SEED và bài giảng PowerPoint dùng hostname, đường dẫn triển khai khác nhau. Cần xác định nhóm đang dùng bản nào trước khi cấu hình endpoint. Với bản container, đường dẫn attacker trên máy ảo được mount vào thư mục phục vụ của Apache. Với bản máy ảo cũ, dùng virtual host có sẵn. Đăng nhập và xem Network trên đúng hostname; cookie của hostname này không tự dùng được cho hostname khác. Endpoint cuối cùng phải lấy từ request thực tế. Môi trường bài tập được chuẩn bị với kiểm tra token CSRF tắt; không suy ra rằng mọi cài đặt Elgg đều có lỗ hổng này.', ['lab','lecture']);
}
{
const s=base('Trình duyệt mang phiên của Alice');
// Requested simple diagram: connectors are created before entity nodes.
const a='diagram-attacker',b='diagram-browser',c='diagram-elgg';
for(const [from,to,x] of [[a,b,400],[b,c,817]]){
  s.shapes.add({geometry:'rightArrow',name:`arrow-${from}-${to}`,position:{left:x,top:303,width:58,height:34},fill:accent,line:{fill:'none',width:0}});
}
for(const [id,x,head,body] of [[a,48,'Trang attacker','Cung cấp JavaScript'],[b,465,'Trình duyệt Alice','Đã đăng nhập Elgg'],[c,882,'Máy chủ Elgg','Xử lý yêu cầu hồ sơ']]){
  s.shapes.add({name:id,geometry:'rect',position:{left:x,top:237,width:350,height:175},fill:pale,line:{fill:'none',width:0}});
  text(s,`${id}-title`,head,x+21,265,308,54,32,{bold:true});
  text(s,`${id}-body`,body,x+21,335,308,54,25,{color:muted});
}
text(s,'arrow1-label','1. Tải trang',48,182,350,40,25,{color:muted});
text(s,'arrow2-label','2. POST + cookie đủ điều kiện',660,182,572,40,25,{color:muted});
text(s,'flow-takeaway','Attacker không cần đọc cookie. Trình duyệt quyết định có gửi cookie đến Elgg hay không.',48,498,1184,92,34);
text(s,'flow-condition','Điều kiện: phiên còn hiệu lực, cookie được phép gửi và máy chủ chấp nhận request.',48,613,1184,46,25,{color:accent});
note(s,55,'Đọc sơ đồ từ trái sang phải. Alice đăng nhập Elgg trước và trình duyệt giữ cookie phiên. Khi Alice mở trang attacker, JavaScript chạy trong trình duyệt và gửi POST tới Elgg. Cookie không được gửi cho attacker; trình duyệt có thể đính kèm cookie thuộc Elgg vào yêu cầu đến Elgg nếu chính sách cho phép. Nếu máy chủ thiếu kiểm chứng ý định của người dùng, nó có thể xử lý yêu cầu đó như một thay đổi hồ sơ hợp lệ. Điểm cần phân biệt là tạo được request khác nguồn không đồng nghĩa đọc được phản hồi, và có cookie cũng chưa đủ nếu máy chủ vẫn kiểm tra token CSRF.', ['lab','fetch']);
}
{
const s=base('About me tương ứng với description');
group(s,'identity','guid và name','GUID công khai của Alice; name giữ đúng tên hiển thị.',48,193);
group(s,'payload','description','Giá trị mới: CSRF attack by <MSV>.',664,193);
group(s,'visibility','accesslevel[description]','Giá trị 2 trong lab cho phép hiển thị công khai.',48,418);
group(s,'csrf','__elgg_ts, __elgg_token','Có trong request hợp lệ; bài lab tắt kiểm tra token.',664,418);
text(s,'endpoint','POST /action/profile/edit — xác nhận lại bằng Network trên môi trường của nhóm.',48,622,1184,45,26,{color:accent});
note(s,55,'Bắt request khi sửa profile hợp lệ bằng Developer Tools. Ghi lại URL, phương thức và tên trường. Trường About me trong tài liệu dùng description; briefdescription là dòng giới thiệu ngắn. GUID phải là của Alice, không sao chép GUID người dùng đang dùng để quan sát. Có thể tìm thông tin GUID từ dữ liệu công khai trên trang hồ sơ tùy phiên bản, thay vì biết mật khẩu nạn nhân. name phải lấy đúng tên hiển thị để tránh đổi nhầm tên. Giữ các trường khác nếu bản Elgg yêu cầu. Chỉ bỏ token trong kịch bản lab đã tắt kiểm tra; không lấy token riêng của Alice rồi gọi đó là chứng minh CSRF.', ['lab','lecture']);
}
{
const s=base('Fetch gửi dữ liệu dạng biểu mẫu');
const code=`const body = new URLSearchParams({\n  name: config.victimName,\n  guid: config.victimGuid,\n  description: "CSRF attack by " + config.studentId,\n  "accesslevel[description]": "2"\n});\n\nawait fetch(config.endpoint, {\n  method: "POST",\n  mode: "no-cors",\n  credentials: "include",\n  body\n});`;
text(s,'fetch-code',code,48,157,1184,440,27,{mono:true});
text(s,'fetch-note','URLSearchParams mã hóa dữ liệu. Trình duyệt tự thiết lập Content-Type phù hợp.',48,619,1184,50,25,{color:accent});
note(s,70,'Đây là đoạn mã rút gọn để giải thích cơ chế; tệp triển khai còn cần kiểm tra cấu hình và hiển thị trạng thái. URLSearchParams đóng gói cặp tên và giá trị, xử lý ký tự đặc biệt và tiếng Việt. Không gán thủ công header Cookie: đó là việc của trình duyệt. Request là POST với kiểu dữ liệu biểu mẫu. no-cors phù hợp yêu cầu đơn giản khác nguồn khi không cần đọc response. credentials include chỉ yêu cầu trình duyệt cân nhắc gửi thông tin phiên. Mã tự chạy khi tải trang attacker theo luồng bài tập. Trước khi chạy, nhóm phải điền endpoint, GUID và MSV thực tế, đồng thời giữ các tham số bắt được nếu phiên bản cần thêm trường.', ['req','fetch']);
}
{
const s=base('Cookie và phản hồi là hai giới hạn riêng');
column(s,'cookie','Cookie vẫn theo chính sách','credentials: "include"\nkhông vượt qua SameSite.\n\nLax / Strict có thể chặn cookie\ntrong cross-site fetch.\n\nChính sách cookie bên thứ ba\ncũng có thể ảnh hưởng.',48);
column(s,'opaque','Opaque chưa xác nhận kết quả','no-cors che nội dung phản hồi.\n\nstatus thường là 0; không dùng\nresponse.ok để kết luận.\n\nMở lại hồ sơ Alice và kiểm tra\nrequest thực tế trong Network.',664);
note(s,70,'Hai vấn đề cần tách riêng: yêu cầu có mang phiên hay không và JavaScript có đọc được phản hồi hay không. Khi cookie bị SameSite hoặc chính sách cookie bên thứ ba chặn, credentials include không ép trình duyệt gửi nó. Với cookie Lax hoặc Strict, cross-site fetch thông thường không có cookie phiên. SameSite None trên môi trường HTTPS cần Secure theo chính sách trình duyệt hiện đại. Không tắt bảo vệ trên hồ sơ trình duyệt dùng hằng ngày; nếu cần tương thích bài tập cũ, dùng môi trường lab riêng đã được giảng viên quy định và ghi rõ cấu hình. Phản hồi opaque không cung cấp mã HTTP thực cho JavaScript. Bằng chứng quyết định là hồ sơ sau khi tải lại và bản ghi Network.', ['fetch','cookies']);
}
{
const s=base('Đối chiếu hồ sơ trước và sau');
const xs=[48,465,882];
['01 • TRƯỚC','02 • THỰC HIỆN','03 • KIỂM TRA'].forEach((v,i)=>text(s,`step-label-${i}`,v,xs[i],201,350,44,25,{color:accent,bold:true}));
[['Hồ sơ ban đầu','Đăng nhập Alice.\nGhi nội dung About me\nvà tên hiển thị hiện tại.'],['Trang attacker','Mở index.html qua\nweb server khác nguồn.\nQuan sát POST trong Network.'],['Hồ sơ đã tải lại','Đối chiếu nội dung với\nCSRF attack by <MSV>.\nKiểm tra lại các trường khác.']].forEach(([h,b],i)=>{text(s,`step-head-${i}`,h,xs[i],283,350,70,32,{bold:true});text(s,`step-body-${i}`,b,xs[i],378,350,198,29,{color:muted});});
text(s,'validation-status','Chỉ đánh dấu đạt sau khi đã quan sát thay đổi trên Elgg thật trong lab.',48,625,1184,45,26,{color:accent});
note(s,60,'Quy trình phải có ảnh trước, yêu cầu phát sinh và ảnh sau. Đầu tiên ghi lại About me ban đầu cùng tên hiển thị của Alice. Mở trang attacker bằng HTTP hoặc HTTPS đúng môi trường, không mở trực tiếp bằng file URL. Trong Network kiểm tra phương thức, endpoint và payload; nếu thiếu cookie thì tìm nguyên nhân chính sách hoặc sai hostname. Cuối cùng mở lại profile Alice và tải mới trang. Kết luận đạt chỉ khi trường About me đúng chuỗi quy định. Kiểm tra tên và các trường khác để tránh tác dụng phụ. Khi lặp lại lần quay, khôi phục nội dung ban đầu trước. Các bước này hiện là quy trình cần thực hiện, chưa phải kết quả quan sát.', ['req','lab']);
}
{
const s=base('Bằng chứng cần thu trên Elgg');
group(s,'e1','01 • Profile trước khi chạy','Trang Alice, About me và tên hiển thị.',48,193);
group(s,'e2','02 • Request hợp lệ','Network: endpoint, POST, description, GUID và các trường.',664,193);
group(s,'e3','03 • Request từ attacker','Network: payload, cookie hoặc lý do trình duyệt chặn.',48,418);
group(s,'e4','04 • Profile sau khi tải lại','Nội dung chính xác theo MSV; thêm ảnh đối chứng bảo vệ.',664,418);
text(s,'evidence-status','Chưa có ảnh chạy thực tế trong bản này. Bổ sung bằng chứng trước khi nộp.',48,621,1184,48,26,{color:accent});
note(s,50,'Đề bài yêu cầu ảnh chụp các bước. Slide này mô tả bộ bằng chứng cần thu; không thay thế yêu cầu ảnh thật. Sau khi chạy lab, bổ sung ảnh vào các slide phân tích request, thực hiện và đối chiếu kết quả, có thể nhân bản slide để ảnh đủ lớn. Không lấy ảnh của bài giảng làm kết quả của nhóm. Khi đưa Network vào slide hoặc video, che giá trị cookie và token phiên mà vẫn giữ được tên header và tên tham số. Ghi phiên bản trình duyệt và cấu hình lab để người xem hiểu điều kiện kiểm thử. Nếu chạy không đạt, trình bày kết quả và nguyên nhân thay vì dùng thông báo opaque làm chứng cứ thành công.', ['req']);
}
{
const s=base('Phân công và công bố AI theo thực tế');
column(s,'roles','Phân công theo vai trò','Môi trường: chuẩn bị Elgg, tài khoản\n\nMã: cấu hình và kiểm tra payload\n\nThực nghiệm: thu ảnh, quay video\n\nBáo cáo: biên tập slide, thuyết minh',48,181);
column(s,'ai','Mức AI: tạo thiết kế và triển khai','AI: khung mã, tài liệu và slide\n\nSinh viên: cung cấp thông số,\nchạy lab, phản biện và biên tập\n\nSinh viên chịu trách nhiệm\nkiểm chứng và sản phẩm nộp.',664,181);
text(s,'team-status','Tên thành viên và MSV chưa được cung cấp; cần gán vai trò trước buổi trình bày.',48,620,1184,48,25,{color:accent});
note(s,65,'Nhóm cần thay bảng phân công theo vai trò bằng tên thật và việc thực tế từng người làm. Các vai trò có thể gộp nếu ít thành viên. Với sản phẩm hiện tại, AI đã tham gia tạo khung thiết kế, mã và nội dung nên cách công bố phù hợp là mức AI tạo sinh thiết kế và triển khai theo yêu cầu, sinh viên cấu hình và ghép nối lại. Không gọi đây chỉ là AI góp ý nếu mã và slide đã được AI tạo. Khi quay video, chỉ rõ phần nào giữ nguyên, phần nào nhóm chỉnh sửa, lý do và cách kiểm chứng. Nhóm tự chạy lab, ghi nhận kết quả, thêm bằng chứng thật và chịu trách nhiệm mọi phát biểu.', ['req']);
}
{
const s=base('Kiểm chứng ý định người dùng ở máy chủ');
text(s,'defense-main','Bật lại kiểm tra token CSRF và thử lại\ncùng yêu cầu để tạo đối chứng.',48,192,1184,130,43,{bold:true});
text(s,'defense-details','Kết hợp cookie SameSite phù hợp và kiểm tra nguồn yêu cầu.\n\nDuy trì cùng tài khoản, endpoint và payload khi so sánh.\n\nGhi lại việc hồ sơ không đổi và phản hồi từ chối của Elgg.',48,379,1184,190,31,{color:muted});
text(s,'final-takeaway','Mục tiêu là chứng minh thay đổi có kiểm soát, rồi giải thích vì sao biện pháp bảo vệ chặn được nó.',48,609,1184,65,28,{color:accent});
note(s,45,'Khép lại bằng đối chứng: khi bật lại cơ chế token, yêu cầu giả mạo thiếu token hợp lệ phải bị từ chối trong phiên bản lab tương ứng. Xác định đúng tệp và cơ chế theo bản Elgg đang chạy thay vì sửa máy móc đường dẫn từ bài giảng. Giữ các điều kiện khác như trước để giải thích được tác động của biện pháp bảo vệ. SameSite và xác thực nguồn bổ sung phòng thủ, không thay thế mọi kiểm tra ở máy chủ. Trước khi nộp, hoàn thiện MSV, tên nhóm, ảnh, kết quả thực nghiệm và liên kết YouTube unlisted. Mã Fetch chỉ là một phần; chứng minh có bằng chứng và hiểu nguyên nhân mới hoàn thành bài thực hành.', ['lab','lecture','defense','req']);
}

await fs.writeFile(path.join(tmp,'source-notes.txt'),Object.entries(refs).map(([k,v])=>`${k}: ${v}`).join('\n')+'\n\nDesign: Codex Grid layouts 01, 04/05, 06, 13, 17 adapted; original lecture is subject matter reading. No external visual assets. No experimental screenshots or measured outcomes are fabricated.\n');
await fs.writeFile(path.join(tmp,'bounds.txt'),boxLog.map(v=>JSON.stringify(v)).join('\n'));
const pptx=await PresentationFile.exportPptx(p);
await pptx.save(path.join(root,'output/CSRF_Elgg_Fetch.pptx'));
await fs.rename(path.join(root,'output/CSRF_Elgg_Fetch.pptx.inspect.ndjson'),path.join(tmp,'deck.inspect.ndjson')).catch(error=>{if(error.code!=='ENOENT')throw error;});
for(let i=0;i<p.slides.items.length;i++){
 const s=p.slides.items[i];
 const png=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(tmp,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
 const layout=await s.export({format:'layout'});
 await fs.writeFile(path.join(tmp,`slide-${String(i+1).padStart(2,'0')}.layout.json`),await layout.text());
}
console.log(`Exported ${p.slides.items.length} slides to output/CSRF_Elgg_Fetch.pptx`);
process.exit(0);
