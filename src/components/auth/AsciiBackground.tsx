import { useEffect, useRef } from 'react';

// Anonymous mask in braille ASCII art - each line is a row
const MASK_ART = [
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⣀⠀⢀⠀⠀⠀⡀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠄⠀⠀⠀⠀⠀⡀⠀⠀⢀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠠⠢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⢁⠀⠀⠀⠀⠈⠀⠀⠄⠀⠄⠀⢀⠄⠐⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠂⠂⠄⠀⢀⠂⡄⠀⡂⠰⢀⠨⣀⠐⠤⠐⡂⠀⠀⠌⢀⡐⠀⢠⠀⠐⠐⠀⢠⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⢐⠀⠀⠰⠀⠀⠀⠀⠀⠀⠰⠈⠄⠁⢀⠠⠀⡀⢠⠀⡆⢊⢁⠠⠠⡀⠀⠂⠀⣀⣀⣃⣀⡀⠑⢁⡠⡠⣰⠀⠀⠀⠄⠣⠀⡄⢠⢀⠀⠁⠀⠈⠀⠂⢀⠀⠀⠀⢰⠀⠀⠰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⢀⠃⢤⣴⣶⣶⠉⠉⠄⠠⠀⠀⠀⠀⠀⠀⣠⠊⠀⠀⠀⠀⠀⠀⠉⠀⠁⠘⠘⠀⠡⠠⠐⠂⠈⠘⠀⠁⠀⠘⢀⠂⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠐⠀⠀⢀⡀⠀⠀⡀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⡄⠂⡁⠦⢌⠸⣿⣿⣿⠐⠈⠠⢀⠡⠐⠀⡐⠠⢰⠃⠀⠀⠀⠀⠀⠀⠀⠀⢀⠄⠀⠀⠀⠰⠁⠊⠀⠁⠀⠀⠀⠄⠀⠘⠠⠃⠡⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⢀⠀⠤⠀⢃⠀⠀⡀⠀⢠⠂⠐⢠⠐⠠⠒⡠⢀⠻⣿⣿⡎⢀⠡⠀⡀⠂⡐⠠⠀⡏⠀⠀⠀⠀⠀⠀⠀⠀⢀⠊⠀⠀⠀⠀⠀⠀⠀⢄⠀⠀⠀⠀⠐⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⢁⠠⢀⢀⢠⠸⠈⠄⢃⠀⢀⢃⠐⡈⡄⢃⡱⣀⠣⣱⣌⠻⣷⠂⠄⠡⠐⠠⠐⢠⢹⠁⠀⠀⡀⠀⠀⡀⢄⠔⠁⠀⠀⡀⠀⠀⠀⠀⠀⠈⢢⡕⢠⠀⠢⢀⢠⠀⡀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠐⢀⠀⠀⠂⠀⠀⣂⢈⠀⠀⠀⠀⠀⢌⡸⡠⢑⠣⡌⢴⣡⠓⣿⣿⣷⢬⡉⠆⡡⢘⠠⢑⠂⢾⠠⠈⢄⠠⡁⣂⠔⠁⢀⠠⣀⠔⣠⠀⠀⠀⠀⠀⠀⠀⣶⠨⡀⢁⠃⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠀⠃⠄⠁⠢⢄⡡⣇⢯⣱⡞⠯⠖⠼⠿⣿⣏⡦⠳⢬⠄⡍⠦⣍⡞⣽⢢⣍⡦⠗⠊⢀⡠⢶⣺⡧⠳⠞⠤⠆⡀⠀⠀⠀⠀⠀⢹⡁⠄⢻⢸⢀⠆⠇⠀⡄⠀⠀⡇⠀⠀⠀⠀⠀',
  '⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢨⠁⢂⡟⣤⣓⡭⠊⠁⠀⠈⠉⣉⣙⡒⠤⢍⡙⠮⡜⢦⡑⡄⡉⠁⠉⠀⠀⡠⠌⠓⡉⠥⠒⠂⠈⠉⠉⠀⠐⠀⠀⠀⠀⡀⡒⣦⠄⡀⡄⠀⢀⡆⠀⡀⠀⠀⠀⠀⠀⠀⠈⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⣀⢄⢈⡀⠸⣜⣦⠏⠀⣀⣠⢤⣄⣈⡉⠉⠁⠀⠀⠈⠑⠬⣂⠹⡰⡑⢌⠒⡌⠒⡡⠒⠁⠀⠀⠀⠀⠀⢀⡀⠤⢤⡀⠀⠀⢀⢀⠃⣶⠃⠇⠸⠀⠆⠡⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠈⡠⠀⠀⠐⡀⠂⠀⠔⡐⡀⢀⠿⣜⣳⠏⣠⢞⡱⢋⠎⡛⠣⠍⡓⠦⣀⡀⠀⠀⠀⠈⠓⡤⢉⠂⠁⠀⠊⠀⠀⠀⠀⠀⠀⠀⠢⠡⠌⠑⠂⠀⠀⠀⡀⢂⢱⠘⠆⢀⠀⢀⠀⠀⠀⠄⠒⠀⠇⠀⠀⠀⢀⠂',
  '⠀⠀⠀⠀⠀⠁⠀⠄⠀⠀⠀⠁⠀⠀⠘⢊⢀⣧⠈⡰⠁⠎⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⢐⡣⢂⠀⠀⠀⠐⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⡐⠎⡘⠀⠂⠈⠀⠀⠂⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠑⡀⠀⠀⠀⢃⠀⢶⡐⣾⠶⠡⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠁⠂⠀⢠⢮⣳⠆⡀⠀⠀⠀⠈⠀⠀⠀⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡐⡄⢣⠁⠀⠀⠀⠇⠀⠡⠁⠀⠀⠀⠀⡀⠁⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡍⣦⡀⠀⠀⠀⠀⠠⠐⢀⣉⣩⣉⣁⠒⠌⡀⠀⠀⢘⣺⣯⡓⠀⠀⠀⠀⠀⡠⠐⣊⣩⣤⣄⣉⣉⠂⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠃⠜⠠⠐⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠠⠀⠀⠀⠀⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠆⠛⡛⠂⠀⢀⣠⣴⣾⣿⣿⣿⣿⣿⣿⣶⣄⠀⢠⢎⢷⣿⡹⠀⠢⠄⠀⣈⣴⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠠⠀⡀⠀⠠⠈⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⡕⡡⣒⣥⣶⣶⣬⣙⡛⠛⠿⠿⠛⠛⠛⢉⢉⣁⢾⣯⣾⣿⡵⠀⢡⠀⠑⠛⠛⠛⠿⠿⠿⠿⠿⠟⢛⡉⠀⠀⡤⣅⠢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⢀⡀⠃⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⢌⣴⣟⣯⣿⣿⣿⣿⣿⣿⠄⠀⣤⣷⣿⣿⣿⢯⣿⣧⣿⣿⡳⠀⢃⢈⠀⠀⢀⣠⣀⠤⣠⡀⠀⠈⠠⠀⢊⠪⡣⠏⡐⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⡁⢌⠨⠀⠀⠀⠀⠆⢰⡀⠀⢘⡾⣹⢏⣯⢛⡻⡟⢧⣋⢮⡑⣯⡽⣿⣿⡿⣛⡷⣏⣷⣿⣟⡁⣯⢀⠄⠈⢐⡳⣬⢛⡥⣏⠳⣄⠀⠀⠈⠐⠁⠀⠀⠀⠀⡖⠐⠀⠄⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⢄⠀⢀⠠⠀⠐⣀⠌⣀⠨⠑⢏⠞⡰⠋⠔⡉⠒⡌⠦⡙⢶⡹⢯⣟⠷⣍⠺⣽⣯⣿⣾⠥⢱⠀⠀⠈⠀⠱⢪⠙⡜⠌⠓⠈⠁⠀⠀⠀⠀⠀⠀⠀⠄⢓⢰⡀⠃⠂⠀⠀⠃⠀⠀⠀⠀⠀⠈⠀⠀',
  '⠀⠀⠀⠀⠀⠰⡀⠆⠀⠀⠀⠀⠀⠀⡀⠀⠮⡔⠀⠊⠐⠁⡈⠀⠄⠁⠀⠀⠁⠂⠁⢋⢞⣽⣿⡟⣮⢿⡧⣝⠚⠀⠤⢸⡷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⢂⣋⠘⠁⠀⡀⠀⠀⠀⠀⠐⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠈⠄⠄⠈⠀⠀⠀⠠⠀⢠⠒⣈⠁⢰⢱⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠚⠋⠃⠈⠀⠊⠐⠀⠀⠀⠀⠀⠁⠁⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢁⢰⠠⠁⡃⠁⡆⡃⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⡀⠈⠀⠀⠀⡀⡌⢀⠀⡀⠅⠃⠌⠁⡈⠀⠱⣄⠀⠀⠀⠀⠀⠀⣀⢤⣶⣿⣿⣇⠠⠈⠀⠀⠀⠠⠤⠐⠈⠀⠈⠀⠀⢸⢏⡖⠤⢀⠀⠀⠀⠀⠀⠀⠀⢠⠀⠀⣍⢈⠈⠀⠀⠀⠀⠁⢁⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠠⠀⠁⠀⠀⠀⠀⠀⡄⠇⠀⠀⠀⠀⢸⠠⣳⡀⠀⢹⣇⠀⠤⢀⠀⠙⢯⣏⣿⣯⣿⡿⢿⠖⡲⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠬⣛⡼⡙⠆⠀⠀⠀⠀⠄⠀⣰⠇⠀⠠⡅⠘⠀⠜⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⢂⠀⠘⠛⠀⠀⢻⣧⠀⠣⡠⠀⠀⠉⠉⠀⠄⠀⠀⠈⠐⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠈⠊⠀⠁⠀⠀⠀⢀⠊⠀⣰⠃⠀⠠⣼⢂⢱⠀⠀⠀⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡖⠀⢀⠀⠀⠹⣧⡀⠉⢆⠠⡀⠤⠤⠄⠀⠒⢀⠀⣤⢄⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠠⠐⠀⠀⡴⠃⢀⠀⢂⢃⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠄⠀⠐⠁⠀⠀⠃⠈⢧⡂⠈⠀⠙⣷⡈⠈⠳⢤⡐⢖⡲⢶⡶⢦⡤⢤⢩⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠞⠁⢀⠁⢐⠀⠘⠀⠀⠀⠀⠀⢀⠀⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠠⠢⠀⢁⠆⠀⠁⠄⡤⡀⢉⠐⠄⢀⢭⣝⡦⠆⠀⠈⢿⣄⠁⠪⢽⡤⠈⠉⠉⠉⠙⠉⠃⠋⠚⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠏⠀⠄⢠⢈⠞⠸⠈⠐⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠁⠀⠁⠀⠀⠀⢁⠀⠀⠫⠘⡰⠐⡜⡼⠛⢷⡐⡄⡀⠀⠹⣦⠁⢎⡹⣣⢆⡀⠀⠰⠆⠀⠀⠀⠀⠲⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⠃⠀⢠⠠⣃⠓⠰⠀⠐⠄⠈⠀⠀⠀⠀⢐⠠⠀⠀⠀⠐⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⡀⠀⠄⠀⢀⡀⠀⠀⠅⠀⢠⠀⠀⠀⡄⡀⠀⡰⢹⢎⢀⡄⠀⠈⢧⠀⡳⡝⣯⣷⢣⡖⡄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠎⠀⠠⢠⠈⠔⠥⣄⠀⠀⠄⠀⡀⢀⠀⠀⠈⠀⡀⠀⠠⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠐⠄⠀⠀⠀⠁⠀⠀⠀⢀⠐⠈⠀⠀⠁⠁⠣⠘⠀⠘⡳⡄⢠⠀⠀⠀⠱⣹⢳⡿⣿⡽⡇⠉⠀⡀⠀⢐⠎⡔⠠⠀⠀⠀⠀⠀⠀⢀⠐⡄⢩⠌⠀⠁⠌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠀⠂⠄⢠⠀⠀⠠⠅⢂⡖⠀⠀⠡⡃⠘⣮⠷⣀⢀⠀⠀⠠⠛⡼⣱⢏⡇⠀⠀⠀⠀⢸⠘⡌⠀⠀⠀⠀⠀⠀⡀⡐⠅⠪⠘⠀⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⢀⠀⠠⠄⢈⠂⠐⠀⠀⠀⢠⢀⠈⠀⡃⡔⡚⡼⣁⢴⠀⠀⠀⠀⠁⠊⠔⠀⠀⠀⠀⠂⠁⠀⠀⠀⠀⠠⣠⠜⡁⡇⠀⢊⠈⢀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⢐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠈⠀⠀⠀⠉⠇⢆⠊⠰⡐⡩⠐⠄⡀⠀⠀⣀⠀⠀⠀⢀⡀⠀⠀⠀⠠⡄⡛⠤⢉⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⡀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠠⠀⠄⠠⠀⠀⠀⠀⠀⠀⠀⡀⠄⢀⡀⠌⢀⢠⠀⡀⠂⠀⠀⠁⠀⢻⣄⠀⠀⠠⠁⠄⡄⠄⠀⡀⠠⠮⠀⠈⠔⠁⠀⠡⠀⠐⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠠⠀⠁⠀⠀⠀⠀⠀⣀⠀⢒⠀⠆⠑⠁⠀⠈⠘⡁⠀⠀⠀⠉⠂⡡⡀⠀⠘⡱⠉⠀⠙⠶⠢⡌⡀⡄⡀⠈⠀⡄⠀⠂⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡕⠄⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⠀⠀⠀⠀⠠⠀⠀⠀⡀⠀⠁⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⢠⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠀⠀⠀',
];

// Ambient floating chars for background
const ASCII_CHARS = '01{}[]()<>#!/$%&@?;:=+-*^~|\\/"\'';
const CODE_SNIPPETS = [
  'function()', 'return', 'const', 'import', 'async', 'await',
  'sudo', 'chmod', 'ssh', 'root', 'exec', 'kill',
  '0x00', '0xFF', '127.0.0.1', '::1', 'tcp/ip',
  '<script>', 'SELECT *', 'DROP TABLE',
  'md5(', 'sha256', 'base64', 'encrypt',
  'GET /', 'POST /', 'HTTP/1.1', '403', '404',
];

interface FloatingChar {
  x: number;
  y: number;
  char: string;
  opacity: number;
  speed: number;
  size: number;
  life: number;
  maxLife: number;
}

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let floatingChars: FloatingChar[] = [];
    let maskFlicker: number[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFloating();
      maskFlicker = MASK_ART.flatMap(line => [...line].map(() => Math.random() * 100));
    };

    const initFloating = () => {
      floatingChars = [];
      const count = Math.floor((canvas.width * canvas.height) / 6000);
      for (let i = 0; i < count; i++) {
        floatingChars.push(createFloating());
      }
    };

    const createFloating = (): FloatingChar => {
      const isSnippet = Math.random() < 0.12;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: isSnippet
          ? CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]
          : ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
        opacity: 0.01 + Math.random() * 0.06,
        speed: 0.1 + Math.random() * 0.4,
        size: 10 + Math.random() * 4,
        life: Math.random() * 300,
        maxLife: 250 + Math.random() * 400,
      };
    };

    const draw = () => {
      time++;

      // Clear with slight trail
      ctx.fillStyle = 'rgb(8, 10, 14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating background chars
      for (let i = 0; i < floatingChars.length; i++) {
        const c = floatingChars[i];
        c.life++;
        c.y += c.speed * 0.2;
        c.x += Math.sin(c.life * 0.008) * 0.1;

        const fadeIn = Math.min(c.life / 60, 1);
        const fadeOut = c.life > c.maxLife * 0.8 ? Math.max(0, 1 - (c.life - c.maxLife * 0.8) / (c.maxLife * 0.2)) : 1;
        const alpha = c.opacity * fadeIn * fadeOut;

        ctx.fillStyle = `rgba(80, 140, 160, ${alpha})`;
        ctx.font = `${c.size}px "Courier New", monospace`;
        ctx.fillText(c.char, c.x, c.y);

        if (c.life > c.maxLife || c.y > canvas.height + 20) {
          floatingChars[i] = createFloating();
          floatingChars[i].y = -20;
          floatingChars[i].life = 0;
        }
      }

      // Draw the ASCII mask centered
      const rows = MASK_ART.length;
      const charWidth = 8.5;
      const lineHeight = 16;
      const cols = MASK_ART[0].length;

      const totalW = cols * charWidth;
      const totalH = rows * lineHeight;

      // Center on the right side of the screen (offset from left panel)
      const offsetX = Math.max(canvas.width * 0.55 - totalW / 2, canvas.width * 0.35);
      const offsetY = (canvas.height - totalH) / 2;

      ctx.font = `14px "Courier New", monospace`;

      let charIdx = 0;
      for (let row = 0; row < rows; row++) {
        const line = MASK_ART[row];
        const chars = [...line];
        for (let col = 0; col < chars.length; col++) {
          const ch = chars[col];
          // Skip empty braille char
          if (ch === '⠀') {
            charIdx++;
            continue;
          }

          // Flicker effect - each char has its own phase
          const flick = maskFlicker[charIdx] || 0;
          const flickerVal = Math.sin(time * 0.03 + flick) * 0.15 + 0.85;
          const pulseVal = Math.sin(time * 0.008 + row * 0.1) * 0.08 + 0.92;
          const alpha = Math.min(0.85, flickerVal * pulseVal * 0.75);

          // Color: white-ish with slight cyan tint
          const r = 180 + Math.floor(Math.sin(time * 0.01 + flick) * 20);
          const g = 195 + Math.floor(Math.sin(time * 0.012 + flick + 1) * 15);
          const b = 210 + Math.floor(Math.sin(time * 0.015 + flick + 2) * 15);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

          const x = offsetX + col * charWidth;
          const y = offsetY + row * lineHeight;

          ctx.fillText(ch, x, y);
          charIdx++;
        }
      }

      // Subtle glow behind the mask
      const glowX = offsetX + totalW / 2;
      const glowY = offsetY + totalH / 2;
      const glowR = Math.max(totalW, totalH) * 0.5;
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowR);
      glow.addColorStop(0, 'rgba(100, 180, 200, 0.03)');
      glow.addColorStop(0.5, 'rgba(80, 150, 170, 0.015)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
