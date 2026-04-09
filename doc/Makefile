-include tpl/Makefile

REPO_RES_DIR := res
REPO_TPL_DIR := tpl
ifeq ($(MKDOCS_ENV), deploy)
    REPO_PREFIX := https://github.com/
else
    REPO_PREFIX := git@github.com:
endif
REPO_RES_URL := $(REPO_PREFIX)openecos-projects/website-res.git
REPO_TPL_URL := $(REPO_PREFIX)openecos-projects/website-tpl-mkdocs.git

LINK_TARGET := src/zh src/en

.PHONY: setup

setup:
	@echo "[setup] checking and setting up dir..."
	@if [ ! -d "$(REPO_RES_DIR)" ]; then                                \
		echo "[setup] cloning res repository...";                       \
		git clone $(REPO_RES_URL) $(REPO_RES_DIR);                      \
	else                                                                \
		echo "[setup] $(REPO_RES_DIR) dir already exists, updating..."; \
		cd $(REPO_RES_DIR) && git pull;                                 \
	fi

	@if [ ! -d "$(REPO_TPL_DIR)" ]; then                                \
		echo "[setup] cloning tpl repository...";                       \
		git clone $(REPO_TPL_URL) $(REPO_TPL_DIR);                      \
	else                                                                \
		echo "[setup] $(REPO_TPL_DIR) dir already exists, updating..."; \
		cd $(REPO_TPL_DIR) && git pull;                                 \
	fi

	@for target in $(LINK_TARGET); do                                          \
		if [ ! -e "$$target/res" ]; then                                       \
			echo "[setup] creating softlink: $$target/res -> $(REPO_RES_DIR)"; \
			cd $$target && mkdir -p res &&                                     \
			find ../../res -mindepth 1 -maxdepth 1 -type d ! -name ".git"      \
				-exec sh -c                                                    \
				'ln -sfn "$$(realpath --relative-to=res "$$1")" res/'          \
				_ {} \; &&                                                     \
			cd -;                                                              \
		else                                                                   \
			echo "[setup] softlink already exists: $$target/res";              \
		fi;                                                                    \
	done
	@echo "[setup] done!"
