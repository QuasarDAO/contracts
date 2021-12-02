#!/bin/sh

truffle-flattener $1 | sed 's/pragma solidity 0.7.5;//g' | sed 's/SPDX-License-Identifier: AGPL-3.0-or-later//g' | (echo -n 'pragma solidity 0.7.5;\n' && cat) | (echo -n '//SPDX-License-Identifier: AGPL-3.0-or-later\n' && cat) | pbcopy
