// === 데이터: 페이지에서 편집 가능 (LocalStorage 지원) ===
const DEFAULT_FOODS = [
  "김치찌개","부대찌개","된장찌개","비빔밥","불고기","제육볶음","치킨","피자","햄버거","칼국수","냉면","라면",
  "김밥","순두부찌개","만두전골","쭈꾸미볶음","초밥","우동","짜장면","짬뽕","마라탕","돈까스","쌀국수",
  "샐러드","타코","파스타","리조또","비빔국수","떡볶이","보쌈","족발","샌드위치","해장국","국밥","찜닭",
  "카레","우렁쌈밥","분짜","나시고랭","훠궈","비프스튜","규동","가츠동","바게트","라자냐","케밥","포케",
  "순대국","동파육","볶음밥","비지찌개"
];

const LS_KEY = 'random-food-picker:list';
function loadFoods(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      const arr = JSON.parse(raw);
      if(Array.isArray(arr) && arr.length){ return arr; }
    }
  }catch(e){}
  return [...DEFAULT_FOODS];
}
function saveFoods(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }
let FOODS = loadFoods();

// === 엘리먼트 ===
const inputsEl = document.getElementById('inputs');
const addBtn = document.getElementById('addBtn');
const pickBtn = document.getElementById('pickBtn');
const clearBtn = document.getElementById('clearBtn');
const resultEl = document.getElementById('result');
const settings = document.getElementById('settings');
const openSettings = document.getElementById('openSettings');
const foodsEditor = document.getElementById('foodsEditor');
const applyFoods = document.getElementById('applyFoods');
const resetFoods = document.getElementById('resetFoods');

// === 유틸 ===
function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFood(){ return FOODS.length ? FOODS[rand(0, FOODS.length-1)] : ''; }
function escapeHtml(s){
  return s.replace(/[&<>"]+/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
}

// === 입력칸 행 생성 ===
function createRow(prefill){
  const row = document.createElement('div');
  row.className = 'row';

  const input = document.createElement('input');
  input.className = 'food';
  input.type = 'text';
  input.inputMode = 'text';
  input.spellcheck = false;
  input.value = prefill || '';
  input.placeholder = '음식 이름을 입력하세요';
  input.setAttribute('aria-label','음식 이름');
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ pickOne(); } });

  const reroll = document.createElement('button');
  reroll.type = 'button';
  reroll.textContent = '🎲';
  reroll.title = '이 칸만 다시 추천';
  reroll.className = 'btn-add';
  reroll.style.minWidth = '56px';
  reroll.addEventListener('click',()=>{
    const r = randomFood();
    if(r){ input.value = r; input.classList.add('pop'); setTimeout(()=>input.classList.remove('pop'), 380); }
  });

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.textContent = '❌';
  delBtn.title = '이 입력칸 삭제';
  delBtn.className = 'btn-delete';
  delBtn.addEventListener('click',()=>{
    const rows = inputsEl.querySelectorAll('.row');
    if(rows.length <= 1){
      // 최소 1개는 남기기
      row.classList.add('shake');
      setTimeout(()=>row.classList.remove('shake'), 320);
      return;
    }
    row.remove();
  });

  row.appendChild(input);
  row.appendChild(reroll);
  row.appendChild(delBtn);
  return row;
}

function addRow(){
  const row = createRow(randomFood());
  inputsEl.appendChild(row);
  row.querySelector('input').focus();
}

function getFoodsFromInputs(){
  return Array.from(inputsEl.querySelectorAll('input.food'))
    .map(i=>i.value.trim())
    .filter(v=>v.length>0);
}

function showResult(text){
  resultEl.innerHTML = `<span class="picked pop">${escapeHtml(text)}</span>`;
}

function pickOne(){
  const list = getFoodsFromInputs();
  if(list.length===0){
    resultEl.innerHTML = '<span class="hint">입력된 음식이 없어요. 입력칸에 음식을 적어주세요.</span>';
    return;
  }
  const choice = list[rand(0, list.length-1)];
  showResult(choice);
  flash();
}

function flash(){
  resultEl.style.boxShadow = '0 0 0 0 rgba(34,197,94,0.7)';
  resultEl.animate(
    [
      { boxShadow:'0 0 0 0 rgba(34,197,94,0.7)' },
      { boxShadow:'0 0 0 18px rgba(34,197,94,0.0)' }
    ],
    { duration:500, easing:'ease-out' }
  );
}

function clearAll(){
  inputsEl.querySelectorAll('input.food').forEach(i=> i.value = '');
  resultEl.innerHTML = '<span class="hint">모두 비웠어요. 음식 이름을 적거나 입력칸을 추가해보세요.</span>';
}

// === 설정 패널 ===
function refreshEditor(){ foodsEditor.value = FOODS.join('\n'); }
openSettings.addEventListener('click', ()=>{ settings.open = true; refreshEditor(); });
settings.addEventListener('toggle', ()=>{ if(settings.open) refreshEditor(); });

applyFoods.addEventListener('click', ()=>{
  const list = foodsEditor.value.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if(list.length === 0){
    alert('최소 1개 이상의 항목이 필요합니다.');
    return;
  }
  FOODS = list;
  saveFoods(FOODS);
  // 첫 행이 비어있으면 하나 추천 채우기
  const firstInput = inputsEl.querySelector('input.food');
  if(firstInput && !firstInput.value){ firstInput.value = randomFood(); }
  settings.open = false;
});

resetFoods.addEventListener('click', ()=>{
  FOODS = [...DEFAULT_FOODS];
  saveFoods(FOODS);
  refreshEditor();
});

// === 초기화 ===
addBtn.addEventListener('click', addRow);
pickBtn.addEventListener('click', pickOne);
clearBtn.addEventListener('click', clearAll);

// 최소 1칸 보장: 초기 1칸 + 랜덤 프리필
(function init(){ addRow(); })();
