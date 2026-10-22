import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMusicQuery, enrichGenreProfile, calculateConfidence } from './musicLogic.js';

test('cleanMusicQuery handles the exact user example with prompt text', () => {
  const result = cleanMusicQuery(' j Balvin - azul determinar genero');
  assert.equal(result.detectedArtist?.toLowerCase(), 'j balvin');
  assert.equal(result.detectedTitle?.toLowerCase(), 'azul');
  assert.equal(result.cleaned.toLowerCase(), 'j balvin - azul');
});

test('cleanMusicQuery cleans noise words like que genero es and cancion', () => {
  const result = cleanMusicQuery('qué género es la canción Queen - Bohemian Rhapsody');
  assert.equal(result.detectedArtist?.toLowerCase(), 'queen');
  assert.equal(result.detectedTitle?.toLowerCase(), 'bohemian rhapsody');
});

test('cleanMusicQuery handles "Azul de J Balvin"', () => {
  const result = cleanMusicQuery('Azul de J Balvin determinar genero');
  assert.equal(result.detectedTitle?.toLowerCase(), 'azul');
  assert.equal(result.detectedArtist?.toLowerCase(), 'j balvin');
});

test('cleanMusicQuery handles single title query gracefully', () => {
  const result = cleanMusicQuery('Despacito');
  assert.equal(result.cleaned, 'Despacito');
});

test('enrichGenreProfile separates Bachata from lazy Tropical/Latino umbrella label', () => {
  const profile = enrichGenreProfile('Tropical', ['latin', 'tropical'], 'romeo santos propuesta indecente');
  assert.match(profile.primaryGenre, /Bachata/);
  assert.equal(profile.isLazyLabelRefined, true);
  assert.match(profile.instruments.join(' '), /Requinto/);
});

test('enrichGenreProfile separates Salsa from lazy Tropical label', () => {
  const profile = enrichGenreProfile('Tropical', ['tropical'], 'hector lavoe periodico de ayer');
  assert.match(profile.primaryGenre, /Salsa/);
  assert.match(profile.typicalRhythm, /Clave/);
});

test('enrichGenreProfile classifies Corridos Tumbados instead of generic Latino', () => {
  const profile = enrichGenreProfile('Latino', ['musica mexicana'], 'peso pluma ella baila sola');
  assert.match(profile.primaryGenre, /Corridos Tumbados/);
  assert.match(profile.instruments.join(' '), /Docerola/);
});

test('enrichGenreProfile classifies Rock en Español instead of generic Latino', () => {
  const profile = enrichGenreProfile('Latino', ['rock'], 'soda stereo de musica ligera');
  assert.match(profile.primaryGenre, /Rock en Español/);
});

test('enrichGenreProfile classifies Cumbia accurately', () => {
  const profile = enrichGenreProfile('Tropical', ['latin'], 'angeles azules 17 anos');
  assert.match(profile.primaryGenre, /Cumbia/);
  assert.match(profile.typicalRhythm, /güiro/i);
});

test('enrichGenreProfile detects Reggaetón for J Balvin Azul', () => {
  const profile = enrichGenreProfile('Latino', ['reggaeton', 'latin urban'], 'j balvin azul');
  assert.match(profile.primaryGenre, /Reggaetón/);
  assert.match(profile.typicalRhythm, /Dembow/);
});

test('calculateConfidence calculates score correctly', () => {
  const fullScore = calculateConfidence(true, true, true, true);
  assert.ok(fullScore >= 95);
});
