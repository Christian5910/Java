const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/quiz.js'), 'utf8');
const oldQuestions = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/quiz-v1-questions.json'), 'utf8'));
const questions = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/questions.json'), 'utf8'));

function attempt(deck, index, finished = false) {
  const quizData = deck.map(q => ({ ...q, options: [...q.options].reverse(), correct: 3 - q.correct }));
  return { currentIndex: index, quizData, quizFinished: finished,
    userAnswers: quizData.map((q,i) => i < index || finished ? q.correct : null) };
}
function resume(saved) {
  let value = JSON.stringify(saved);
  const notice = { textContent: '' };
  const context = vm.createContext({
    document: { getElementById: () => notice },
    localStorage: { getItem: () => value, setItem: (_,text) => { value = text; } }
  });
  vm.runInContext(source.slice(0, source.indexOf('const loaded = loadProgress()')), context);
  const loaded = vm.runInContext('loadProgress()', context);
  const state = JSON.parse(vm.runInContext('JSON.stringify({currentIndex, userAnswers, answerStatus, quizFinished, quizData:QUIZ_DATA})', context));
  return { loaded, state, stored: JSON.parse(value), notice: notice.textContent };
}

const ongoing = attempt(oldQuestions, 5);
ongoing.userAnswers[1] = (ongoing.quizData[1].correct+1)%4;
ongoing.userAnswers[5] = ongoing.quizData[5].correct;
const migrated = resume(ongoing);
assert.equal(migrated.loaded, true);
assert.equal(migrated.state.currentIndex, 5);
assert.equal(migrated.state.quizData.length, 60);
assert.deepEqual(migrated.state.quizData.slice(0,40), ongoing.quizData);
assert.deepEqual(migrated.state.userAnswers.slice(0,40), ongoing.userAnswers);
assert.equal(migrated.state.answerStatus[1], false);
assert.ok(migrated.state.userAnswers.slice(40).every(a=>a===null));
assert.equal(migrated.stored.quizData.length, 60);
assert.match(migrated.notice, /20 questões novas/);

const finished = attempt(oldQuestions, 39, true);
const continued = resume(finished);
assert.equal(continued.loaded, true);
assert.equal(continued.state.currentIndex, 40);
assert.equal(continued.state.quizFinished, false);
assert.deepEqual(continued.state.userAnswers.slice(0,40), finished.userAnswers);

const complete = resume(attempt(questions, 59, true));
assert.equal(complete.loaded, true);
assert.equal(complete.state.quizFinished, true);
assert.equal(complete.state.currentIndex, 59);
assert.equal(complete.notice, '');

for (const damage of [
  saved => { saved.quizData[0].text = 'Outra questão'; },
  saved => { saved.quizData[0].options[0] = saved.quizData[0].options[1]; },
  saved => { saved.quizData[0].correct = '3'; },
  saved => { saved.userAnswers[1] = '3'; },
  saved => { saved.userAnswers[10] = 0; },
  saved => { saved.currentIndex = -1; },
  saved => { saved.quizFinished = true; }
]) {
  const saved = attempt(oldQuestions,5);
  damage(saved);
  assert.equal(resume(saved).loaded, false);
}
console.log('PASS: 40→60 migration preserves answers, order and score; resumes completed attempts; rejects invalid saves.');
